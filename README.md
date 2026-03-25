# React + Tailwind 4.0 + Drizzle ORM Electrobun 应用

一个使用 Electrobun 构建的桌面 Todo 应用，集成了 React 19、Tailwind CSS 4.0 和 Drizzle ORM (Beta)。

## 技术栈

- **Electrobun** - 桌面应用框架
- **React 19** - UI 框架
- **Tailwind CSS 4.0** - 样式框架
- **Vite** - 构建工具 + HMR
- **Drizzle ORM Beta** - 类型安全的数据库 ORM
- **SQLite** - 嵌入式数据库

## 首次运行设置（重要）

### 步骤 1：安装依赖

```bash
bun install
```

### 步骤 2：首次运行获取数据库路径

```bash
bun run start
```

应用启动后，控制台会打印出数据库文件的实际路径，例如：
```
Database path: C:/Users/YourUser/AppData/Local/sqlitecrud.electrobun.dev/dev/todos.db
```

### 步骤 3：配置 Drizzle

复制控制台输出的数据库路径，将其粘贴到 `drizzle.config.ts` 文件中的 `dbPath` 变量：

```typescript
// drizzle.config.ts
export const dbPath = "C:/Users/YourUser/AppData/Local/sqlitecrud.electrobun.dev/dev/todos.db";
```

### 步骤 4：创建数据库表

```bash
bun run db:push
```

## 开发命令

```bash
# 开发模式（无 HMR，使用打包后的资源）
bun run dev

# 开发模式（带 HMR，推荐）
bun run dev:hmr

# 构建生产版本
bun run build:canary

# 数据库相关
bun run db:push      # 推送 schema 到数据库
bun run db:generate   # 生成 migration 文件
```

## 数据库操作

数据库表会在应用启动时自动创建（`src/bun/db/connection.ts`）。

### Schema 定义

数据库表定义在 `src/bun/db/schema.ts`：

```typescript
export const todoTable = l.sqliteTable("todo_table", {
  id: l.int().primaryKey({ autoIncrement: true }),
  title: l.text().notNull(),
  completed: l.integer().notNull().default(0),
  created_at: l.integer({ mode: 'timestamp' }).notNull(),
  updated_at: l.integer({ mode: 'timestamp' }).notNull(),
});
```

### 使用 Drizzle 查询

```typescript
// 查询所有
await db.select().from(todoTable).orderBy(desc(todoTable.created_at))

// 插入
await db.insert(todoTable).values({ title, completed: 0 })

// 更新
await db.update(todoTable).set({ title }).where(eq(todoTable.id, id))

// 删除
await db.delete(todoTable).where(eq(todoTable.id, id))
```

## 项目结构

```
├── src/
│   ├── bun/
│   │   ├── index.ts        # 主进程入口，RPC 处理
│   │   └── db/
│   │       ├── schema.ts       # Drizzle 表定义
│   │       ├── relation.ts     # 表关系
│   │       ├── connection.ts   # 数据库连接
│   │       └── index.ts        # 导出
│   └── mainview/
│       ├── App.tsx         # React 根组件
│       ├── main.tsx        # React 入口
│       ├── index.html      # HTML 模板
│       └── index.css       # Tailwind CSS
├── drizzle/                # Drizzle 生成的 migration 文件
├── drizzle.config.ts       # Drizzle 配置
├── electrobun.config.ts    # Electrobun 配置
├── vite.config.ts          # Vite 配置
└── package.json
```

## Tailwind CSS 4.0

Tailwind 4.0 使用新的 Vite 插件方式集成：

```css
/* src/mainview/index.css */
@import "tailwindcss";
```

## HMR 工作原理

运行 `bun run dev:hmr` 时：

1. Vite 开发服务器在 `http://localhost:5173` 启动
2. Electrobun 检测到 Vite 服务器并加载
3. React 组件修改后实时更新，无需重新构建

运行 `bun run dev` 时：

1. Electrobun 从 `views://mainview/index.html` 加载
2. 需要运行 `vite build` 重新构建才能看到更改

## 常见问题

### Q: `db.query` 不可用？
A: `drizzle-orm/bun-sqlite` 不自动生成 `db.query` API，请使用 `db.select().from()`。

### Q: 数据库路径错误？
A: 必须先运行一次应用获取实际路径，然后更新 `drizzle.config.ts`。

### Q: 表不存在？
A: 运行 `bun run db:push` 或重启应用（会在启动时自动创建表）。
