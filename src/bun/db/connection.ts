import { drizzle } from "drizzle-orm/bun-sqlite";
import { Utils } from "electrobun/bun";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { relations } from "./relation";

// Ensure data directory exists
const dataDir = Utils.paths.userData;
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// 数据库文件名，默认使用 todos.db
const DB_FILE_NAME = process.env["DB_FILE_NAME"] || "todos.db";

// Initialize SQLite database
export const dbPath = join(dataDir, DB_FILE_NAME);
console.log(`Database path: ${dbPath}`);
export const db = drizzle(dbPath, { relations });
