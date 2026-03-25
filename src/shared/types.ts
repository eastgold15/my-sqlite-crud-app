import type { RPCSchema } from "electrobun/bun";

export type Todo = {
  id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
};

export type Stats = {
  total: number;
  completed: number;
};

export type TodoRPC = {
  bun: RPCSchema<{
    requests: {
      getTodos: { params: {}; response: Todo[] };
      addTodo: { params: { title: string }; response: Todo };
      updateTodo: { params: { id: number; title: string }; response: Todo };
      toggleTodo: { params: { id: number }; response: Todo };
      deleteTodo: { params: { id: number }; response: { success: boolean } };
      clearCompleted: { params: {}; response: { deleted: number } };
      getStats: { params: {}; response: Stats };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};