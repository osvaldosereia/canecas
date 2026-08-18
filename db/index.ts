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
    binding.prepare(`CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      source_job_id TEXT UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      image_url TEXT NOT NULL DEFAULT '',
      phrase TEXT NOT NULL,
      accent TEXT NOT NULL DEFAULT 'blue',
      status TEXT NOT NULL DEFAULT 'review',
      likes INTEGER NOT NULL DEFAULT 0,
      uses INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    binding.prepare("CREATE INDEX IF NOT EXISTS models_status_idx ON models (status, created_at)"),
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
      tracking_code TEXT NOT NULL DEFAULT '',
      tracking_url TEXT NOT NULL DEFAULT '',
      admin_notes TEXT NOT NULL DEFAULT '',
      mode TEXT NOT NULL DEFAULT 'demo',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    binding.prepare("CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at)"),
    binding.prepare("CREATE INDEX IF NOT EXISTS orders_personalization_idx ON orders (personalization_id)"),
  ]);
  await binding.batch([
    binding.prepare("INSERT OR IGNORE INTO models (id, title, category, tags, image_url, phrase, accent, status, likes, uses) VALUES (1, ?, ?, ?, ?, ?, ?, 'published', 284, 91)").bind("Onde há amor, há lar", "Família", '["amor","casa","presente"]', "/models/modelo-floral.webp", "Onde há amor, há lar", "coral"),
    binding.prepare("INSERT OR IGNORE INTO models (id, title, category, tags, image_url, phrase, accent, status, likes, uses) VALUES (2, ?, ?, ?, ?, ?, ?, 'published', 516, 167)").bind("Leve a vida no seu ritmo", "Mato Grosso", '["capivara","pantanal","humor"]', "/models/modelo-pantanal.webp", "Leve a vida no seu ritmo", "sage"),
    binding.prepare("INSERT OR IGNORE INTO models (id, title, category, tags, image_url, phrase, accent, status, likes, uses) VALUES (3, ?, ?, ?, ?, ?, ?, 'published', 391, 133)").bind("Deus cuida de cada detalhe", "Fé", '["fé","católica","presente"]', "/models/modelo-fe.webp", "Deus cuida de cada detalhe", "blue"),
    binding.prepare("INSERT OR IGNORE INTO models (id, title, category, tags, image_url, phrase, accent, status, likes, uses) VALUES (4, ?, ?, ?, '', ?, ?, 'published', 228, 74)").bind("Professora que inspira", "Profissões", '["professora","gratidão","escola"]', "Professora que inspira todos os dias", "lavender"),
    binding.prepare("INSERT OR IGNORE INTO models (id, title, category, tags, image_url, phrase, accent, status, likes, uses) VALUES (5, ?, ?, ?, '', ?, ?, 'published', 633, 208)").bind("Mãe, meu lugar favorito", "Mães", '["mãe","afeto","flores"]', "Mãe, você é meu lugar favorito", "rose"),
    binding.prepare("INSERT OR IGNORE INTO models (id, title, category, tags, image_url, phrase, accent, status, likes, uses) VALUES (6, ?, ?, ?, '', ?, ?, 'published', 472, 156)").bind("Café primeiro, decisões depois", "Humor", '["café","humor","rotina"]', "Café primeiro, decisões depois", "coffee"),
  ]);
  for (const statement of [
    "ALTER TABLE orders ADD COLUMN tracking_code TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN tracking_url TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN admin_notes TEXT NOT NULL DEFAULT ''",
  ]) {
    try { await binding.prepare(statement).run(); }
    catch (error) { if (!String(error).toLowerCase().includes("duplicate column")) throw error; }
  }
}
