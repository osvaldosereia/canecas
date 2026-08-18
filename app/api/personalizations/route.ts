import { eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { personalizations } from "../../../db/schema";

type RequestBody = {
  modelId?: number;
  modelTitle?: string;
  sourceImage?: string;
  artName?: string;
  phrase?: string;
  customer?: { name?: string; email?: string; phone?: string };
};

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function safeJob(row: typeof personalizations.$inferSelect) {
  return { id: row.id, token: row.publicToken, status: row.status, mode: row.mode, artImageUrl: row.artImageUrl, mugMockupUrl: row.mugMockupUrl, error: row.error };
}

function generationPrompt(modelTitle: string, artName: string, phrase: string) {
  return [
    `Use a imagem do modelo oficial “${modelTitle}” como referência visual principal.`,
    `Substitua apenas o conteúdo textual pelo nome “${artName}” e pela frase “${phrase}”, corrigindo acentuação e mantendo a leitura perfeita em português do Brasil.`,
    "Preserve o estilo, a paleta, a composição e os elementos decorativos da referência; não acrescente marcas, assinaturas ou textos extras.",
    "Entregue duas imagens: (1) arte final quadrada, frontal, alta resolução, fundo opaco e margem segura para sublimação; (2) mockup fotorealista da mesma arte aplicada em uma única caneca branca de 11 oz, com alça visível e fundo claro.",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RequestBody;
    const modelId = Number(body.modelId);
    const modelTitle = clean(body.modelTitle, 100);
    const sourceImage = clean(body.sourceImage, 300);
    const artName = clean(body.artName, 30);
    const phrase = clean(body.phrase, 80);
    const customerName = clean(body.customer?.name, 80);
    const customerEmail = clean(body.customer?.email, 120).toLowerCase();
    const customerPhone = clean(body.customer?.phone, 20);
    if (!Number.isInteger(modelId) || modelId < 1 || !modelTitle || !artName || !phrase || !customerName || customerPhone.replace(/\D/g, "").length < 10 || !validEmail(customerEmail)) {
      return Response.json({ error: "Revise nome, frase, celular e e-mail." }, { status: 400 });
    }

    await ensureDatabase();
    const db = await getDb();
    const id = crypto.randomUUID();
    const publicToken = crypto.randomUUID();
    const webhookUrl = process.env.MAKE_PERSONALIZATION_WEBHOOK_URL?.trim();
    const webhookSecret = process.env.MAKE_WEBHOOK_SECRET?.trim();
    const mode = webhookUrl && webhookSecret ? "live" : "demo";
    const initialStatus = mode === "live" ? "queued" : "demo_ready";
    const [created] = await db.insert(personalizations).values({ id, publicToken, modelId, modelTitle, sourceImage, artName, phrase, customerName, customerEmail, customerPhone, status: initialStatus, mode }).returning();

    if (mode === "demo") return Response.json(safeJob(created), { status: 202 });

    const origin = new URL(request.url).origin;
    const sourceImageUrl = sourceImage ? new URL(sourceImage, origin).toString() : null;
    const makeResponse = await fetch(webhookUrl!, {
      method: "POST",
      headers: { "content-type": "application/json", "x-webhook-secret": webhookSecret! },
      body: JSON.stringify({
        requestId: id,
        model: { id: modelId, title: modelTitle, sourceImageUrl },
        personalization: { name: artName, phrase },
        customer: { name: customerName, email: customerEmail, phone: customerPhone },
        output: { squareArt: true, whiteMug11ozMockup: true },
        prompt: generationPrompt(modelTitle, artName, phrase),
        callback: { url: `${origin}/api/personalizations/${id}/callback`, authorization: `Bearer ${webhookSecret}` },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!makeResponse.ok) throw new Error(`Make respondeu com status ${makeResponse.status}.`);
    const makeResult = await makeResponse.json().catch(() => ({})) as { jobId?: string; status?: string; artImageUrl?: string; mugMockupUrl?: string };
    const isReady = Boolean(makeResult.artImageUrl && makeResult.mugMockupUrl);
    const [updated] = await db.update(personalizations).set({ providerJobId: clean(makeResult.jobId, 120) || null, status: isReady ? "ready" : "processing", artImageUrl: clean(makeResult.artImageUrl, 1000) || null, mugMockupUrl: clean(makeResult.mugMockupUrl, 1000) || null, updatedAt: new Date().toISOString() }).where(eq(personalizations.id, id)).returning();
    return Response.json(safeJob(updated), { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível iniciar a personalização.";
    return Response.json({ error: message }, { status: 500 });
  }
}
