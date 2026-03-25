import { count, desc, eq, sum } from "drizzle-orm";
import { BrowserView, BrowserWindow, Updater } from "electrobun/bun";
import type { Todo, TodoRPC } from "../shared/types";
import { db, todoTable } from './db/index';

type FilterType = "all" | "active" | "completed";

// 声明 mainWindow 变量（在 RPC 之前声明，以便 RPC 内部可以使用）
let mainWindow: BrowserWindow;

// Create the main application window first
const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
      return DEV_SERVER_URL;
    } catch {
      console.log(
        "Vite dev server not running. Run 'bun run dev:hmr' for HMR support.",
      );
    }
  }
  return "views://mainview/index.html";
}

const url = await getMainViewUrl();

// Define RPC
const todoRPC = BrowserView.defineRPC<TodoRPC>({
  maxRequestTime: 5000,
  handlers: {
    requests: {
      getTodos: async () => {
        return await db.select().from(todoTable).orderBy(desc(todoTable.created_at)) as unknown as Todo[];
      },
      addTodo: ({ title }) => {
        return db.insert(todoTable).values({
          title,
          completed: 0
        }) as unknown as Todo;
      },
      updateTodo: async ({ id, title }) => {
        return await db.update(todoTable).set({
          title,
        }).where(eq(todoTable.id, id)) as unknown as Todo;
      },
      toggleTodo: async ({ id }) => {
        const current = await db.select({ completed: todoTable.completed })
          .from(todoTable)
          .where(eq(todoTable.id, id))
          .then(rows => rows[0]);
        if (!current) throw new Error('Todo not found');
        return await db.update(todoTable)
          .set({ completed: current.completed ? 0 : 1 })
          .where(eq(todoTable.id, id))
          .returning()
          .then(rows => rows[0]) as unknown as Todo;
      },
      deleteTodo: async ({ id }) => {
        await db.delete(todoTable).where(eq(todoTable.id, id));
        return { success: true };
      },
      clearCompleted: async () => {
        const result = await db.delete(todoTable)
          .where(eq(todoTable.completed, 1))
          .returning();
        return { deleted: result.length };
      },
      getStats: async () => {
        const [totalResult, completedResult] = await Promise.all([
          db.select({ total: count() }).from(todoTable),
          db.select({ completed: sum(todoTable.completed) }).from(todoTable)
        ]);
        return {
          total: totalResult[0].total,
          completed: Number(completedResult[0].completed || 0)
        };
      },
      closeWindow: () => {
        mainWindow.close();
      },
    },
    messages: {},
  },
});

// Create the main application window (after RPC is defined)
mainWindow = new BrowserWindow({
  title: "Todo App",
  url,
  rpc: todoRPC,
  titleBarStyle: "hidden", // 隐藏原生标题栏
  frame: {
    width: 600,
    height: 800,
    x: 200,
    y: 200,
  },
});

console.log("React Tailwind Vite app started!");
console.log("SQLite Todo app started!");
