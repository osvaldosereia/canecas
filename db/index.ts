import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

async function getBinding() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Banco de dados indisponível.");
  return env.DB;
}

export async function getDb() {
  return drizzle(await getBinding(), { schema });
}

export async function ensureDatabase() {
  const binding = await getBinding();
  await binding.batch([
    binding.prepare(`CREATE TABLE IF NOT EXISTS personalizations (
      id TEXT PRIMARY KEY NOT NULL,
      public_token TEXT NOT NULL UNIQUE,
      model_id INTEGER NOT NULL,
      model_title TEXT NOT NULL,
      source_image TEXT NOT NULL DEFAULT '',
      art_name TEXT NOT NULL,
      phrase TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      mode TEXT NOT NULL DEFAULT 'live',
      provider_job_id TEXT,
      art_image_url TEXT,
      mug_mockup_url TEXT,
      error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    binding.prepare("CREATE INDEX IF NOT EXISTS personalizations_status_idx ON personalizations (status, created_at)"),
  ]);
}
