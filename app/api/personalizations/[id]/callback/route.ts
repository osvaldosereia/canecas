import { eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../../../db";
import { personalizations } from "../../../../../db/schema";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validHttpUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; } };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const secret = process.env.MAKE_WEBHOOK_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-webhook-secret");
  if (!secret || (authorization !== `Bearer ${secret}` && headerSecret !== secret)) return Response.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json() as { status?: string; jobId?: string; artImageUrl?: string; mugMockupUrl?: string; error?: string };
  const artImageUrl = clean(body.artImageUrl, 1000);
  const mugMockupUrl = clean(body.mugMockupUrl, 1000);
  const requestedStatus = clean(body.status, 30).toLowerCase();
  const failed = requestedStatus === "failed" || Boolean(body.error);
  if (!failed && (!validHttpUrl(artImageUrl) || !validHttpUrl(mugMockupUrl))) return Response.json({ error: "A callback precisa incluir as duas URLs de imagem." }, { status: 400 });
  await ensureDatabase();
  const db = await getDb();
  const [updated] = await db.update(personalizations).set({ status: failed ? "failed" : "ready", providerJobId: clean(body.jobId, 120) || null, artImageUrl: failed ? null : artImageUrl, mugMockupUrl: failed ? null : mugMockupUrl, error: failed ? clean(body.error, 300) || "Falha informada pela automação." : null, updatedAt: new Date().toISOString() }).where(eq(personalizations.id, id)).returning();
  if (!updated) return Response.json({ error: "Personalização não encontrada." }, { status: 404 });
  return Response.json({ ok: true, id: updated.id, status: updated.status });
}
