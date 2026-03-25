
import { defineConfig } from 'drizzle-kit';
// 数据库文件名，默认使用 todos.db
const DB_FILE_NAME = process.env["DB_FILE_NAME"] || "todos.db";
// Initialize SQLite database
// 这里这个数据库的位置必须要先运行一次start, 然后看一下它的数据库在哪个位置，然后你再替换掉它
export const dbPath = "C:/Users/boer/AppData/Local/sqlitecrud.electrobun.dev/dev/todos.db";

export default defineConfig({
  out: './drizzle',
  schema: './src/bun/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    // 开发环境使用本地文件，生产环境会在 userData 目录
    url: dbPath,
  },
});
