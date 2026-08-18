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
    binding.prepare(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      public_token TEXT NOT NULL UNIQUE,
      personalization_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'awaiting_payment',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_cents INTEGER NOT NULL,
      subtotal_cents INTEGER NOT NULL,
      shipping_price_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL,
      shipping_service_id TEXT NOT NULL,
      shipping_service_name TEXT NOT NULL,
      shipping_company TEXT NOT NULL,
      shipping_min_days INTEGER,
      shipping_max_days INTEGER,
      postal_code TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      address_number TEXT NOT NULL DEFAULT '',
      complement TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      payment_provider TEXT NOT NULL DEFAULT 'mercado_pago',
      payment_preference_id TEXT,
      payment_id TEXT,
      checkout_url TEXT,
      mode TEXT NOT NULL DEFAULT 'demo',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    binding.prepare("CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at)"),
    binding.prepare("CREATE INDEX IF NOT EXISTS orders_personalization_idx ON orders (personalization_id)"),
  ]);
}
