import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  nafees: integer("nafees").notNull().default(0),
  waqas: integer("waqas").notNull().default(0),
  cheetan: integer("cheetan").notNull().default(0),
  nadeem: integer("nadeem").notNull().default(0),
  totalMinutes: integer("total_minutes").notNull().default(0),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseAmount: real("base_amount").notNull().default(10000),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  totalMinutes: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
