import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const personalizations = sqliteTable("personalizations", {
  id: text("id").primaryKey(),
  publicToken: text("public_token").notNull().unique(),
  modelId: integer("model_id").notNull(),
  modelTitle: text("model_title").notNull(),
  sourceImage: text("source_image").notNull().default(""),
  artName: text("art_name").notNull(),
  phrase: text("phrase").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  status: text("status").notNull().default("queued"),
  mode: text("mode").notNull().default("live"),
  providerJobId: text("provider_job_id"),
  artImageUrl: text("art_image_url"),
  mugMockupUrl: text("mug_mockup_url"),
  error: text("error"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
