import { eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { orders, personalizations } from "../../../db/schema";
import { MUG, cleanText, onlyDigits, safeOrder, unitPriceCents } from "../../../lib/commerce";
import { getShippingQuotes } from "../../../lib/shipping";

type Body = {
  personalizationId?: string;
  personalizationToken?: string;
  quantity?: number;
  shippingServiceId?: string;
  postalCode?: string;
  address?: { street?: string; number?: string; complement?: string; district?: string; city?: string; state?: string };
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as Body;
    const personalizationId = cleanText(body.personalizationId, 80);
    const personalizationToken = cleanText(body.personalizationToken, 80);
    const quantity = Math.min(10, Math.max(1, Number(body.quantity) || 1));
    const postalCode = onlyDigits(body.postalCode, 8);
    const shippingServiceId = cleanText(body.shippingServiceId, 80);
    if (!personalizationId || !personalizationToken || postalCode.length !== 8 || !shippingServiceId) return Response.json({ error: "Dados do pedido incompletos." }, { status: 400 });

    await ensureDatabase();
    const db = await getDb();
    const [personalization] = await db.select().from(personalizations).where(eq(personalizations.id, personalizationId)).limit(1);
    if (!personalization || personalization.publicToken !== personalizationToken) return Response.json({ error: "Personalização não encontrada." }, { status: 404 });
    if (!["ready", "demo_ready"].includes(personalization.status)) return Response.json({ error: "A prévia ainda não está pronta." }, { status: 409 });

    const shipping = await getShippingQuotes(postalCode, quantity);
    const selected = shipping.quotes.find(quote => quote.id === shippingServiceId);
    if (!selected) return Response.json({ error: "Escolha uma opção de entrega válida." }, { status: 400 });

    const street = cleanText(body.address?.street, 120);
    const number = cleanText(body.address?.number, 20);
    const complement = cleanText(body.address?.complement, 80);
    const district = cleanText(body.address?.district, 80);
    const city = cleanText(body.address?.city, 80);
    const state = cleanText(body.address?.state, 2).toUpperCase();
    if (!selected.pickup && (!street || !number || !district || !city || state.length !== 2)) return Response.json({ error: "Preencha o endereço completo para entrega." }, { status: 400 });

    const id = crypto.randomUUID();
    const publicToken = crypto.randomUUID();
    const price = unitPriceCents();
    const subtotal = price * quantity;
    const total = subtotal + selected.priceCents;
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
    const mode = accessToken ? "live" : "demo";
    const [created] = await db.insert(orders).values({ id, publicToken, personalizationId, status: "awaiting_payment", paymentStatus: "pending", quantity, unitPriceCents: price, subtotalCents: subtotal, shippingPriceCents: selected.priceCents, totalCents: total, shippingServiceId: selected.id, shippingServiceName: selected.name, shippingCompany: selected.company, shippingMinDays: selected.minDays, shippingMaxDays: selected.maxDays, postalCode, address: selected.pickup ? "Retirada local" : street, addressNumber: selected.pickup ? "" : number, complement: selected.pickup ? "" : complement, district: selected.pickup ? "" : district, city: selected.pickup ? "Cuiabá" : city, state: selected.pickup ? "MT" : state, mode }).returning();
    if (!accessToken) return Response.json(safeOrder(created), { status: 201 });

    const origin = new URL(request.url).origin;
    const customerParts = personalization.customerName.split(/\s+/);
    const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json", "x-idempotency-key": id },
      body: JSON.stringify({
        items: [{ id: "caneca-11oz", title: MUG.title, description: `Modelo: ${personalization.modelTitle}`, category_id: "art", quantity, currency_id: "BRL", unit_price: price / 100 }],
        shipments: { cost: selected.priceCents / 100, mode: "not_specified" },
        payer: { name: customerParts[0] || personalization.customerName, surname: customerParts.slice(1).join(" "), email: personalization.customerEmail, phone: { number: onlyDigits(personalization.customerPhone) }, address: { zip_code: postalCode, street_name: selected.pickup ? "Retirada local" : street, street_number: selected.pickup ? "0" : number } },
        external_reference: id,
        statement_descriptor: "CANECAS",
        metadata: { order_id: id, personalization_id: personalizationId, shipping_service: selected.name },
        back_urls: { success: `${origin}/pedido/${id}?token=${publicToken}&retorno=sucesso`, pending: `${origin}/pedido/${id}?token=${publicToken}&retorno=pendente`, failure: `${origin}/pedido/${id}?token=${publicToken}&retorno=falha` },
        auto_return: "approved",
        notification_url: `${origin}/api/payments/mercado-pago/webhook`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!preferenceResponse.ok) {
      await db.update(orders).set({ status: "payment_error", updatedAt: new Date().toISOString() }).where(eq(orders.id, id));
      return Response.json({ ...safeOrder(created), error: "O pagamento não pôde ser iniciado agora." }, { status: 502 });
    }
    const preference = await preferenceResponse.json() as { id?: string; init_point?: string; sandbox_init_point?: string };
    const checkoutUrl = preference.init_point || preference.sandbox_init_point || null;
    if (!preference.id || !checkoutUrl) return Response.json({ ...safeOrder(created), error: "O Mercado Pago não devolveu o link de pagamento." }, { status: 502 });
    const [updated] = await db.update(orders).set({ paymentPreferenceId: preference.id, checkoutUrl, updatedAt: new Date().toISOString() }).where(eq(orders.id, id)).returning();
    return Response.json(safeOrder(updated), { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível criar o pedido." }, { status: 500 });
  }
}
