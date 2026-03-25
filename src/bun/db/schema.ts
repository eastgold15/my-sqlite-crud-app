import { sql } from "drizzle-orm";
import * as l from "drizzle-orm/sqlite-core";

export const todoTable = l.sqliteTable("todo_table", {
  id: l.int().primaryKey({ autoIncrement: true }),
  title: l.text().notNull(),
  completed: l.integer().notNull().default(0),
  created_at: l.integer({ mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIME)`),
  updated_at: l.integer({ mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIME)`),
});
