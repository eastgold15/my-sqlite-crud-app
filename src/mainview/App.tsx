import { useEffect, useState } from "react";
import Electrobun, { Electroview } from "electrobun/view";
import type { Todo, TodoRPC } from "../shared/types";




const rpc = Electroview.defineRPC<TodoRPC>({
	maxRequestTime: 5000,
	handlers: { requests: {}, messages: {} },
});

const electrobun = new Electrobun.Electroview({ rpc });

type FilterType = "all" | "active" | "completed";

function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [filter, setFilter] = useState<FilterType>("all");
	const [inputValue, setInputValue] = useState("");
	const [stats, setStats] = useState({ total: 0, completed: 0 });

	// 加载todos
	useEffect(() => {
		loadTodos();
		loadStats();
	}, []);

	async function loadTodos() {
		const data = await electrobun.rpc!.request.getTodos({});
		setTodos(data);
	}

	async function loadStats() {
		const data = await electrobun.rpc!.request.getStats({});
		setStats(data);
	}

	async function addTodo() {
		const title = inputValue.trim();
		if (!title) return;
		await electrobun.rpc!.request.addTodo({ title });
		setInputValue("");
		await loadTodos();
		await loadStats();
	}

	async function toggleTodo(id: number) {
		await electrobun.rpc!.request.toggleTodo({ id });
		await loadTodos();
		await loadStats();
	}

	async function deleteTodo(id: number) {
		await electrobun.rpc!.request.deleteTodo({ id });
		await loadTodos();
		await loadStats();
	}

	async function clearCompleted() {
		await electrobun.rpc!.request.clearCompleted({});
		await loadTodos();
		await loadStats();
	}

	function getFilteredTodos(): Todo[] {
		switch (filter) {
			case "active":
				return todos.filter((t) => !t.completed);
			case "completed":
				return todos.filter((t) => t.completed);
			default:
				return todos;
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + "Z");
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});
	}

	const filteredTodos = getFilteredTodos();
	const activeCount = stats.total - stats.completed;

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-gray-900">
			<div className="container mx-auto px-4 py-10 max-w-2xl">
				{/* Header */}
				<h1 className="text-4xl font-bold text-center text-white mb-2 drop-shadow-lg">
					Todo App
				</h1>
				<p className="text-center text-white/90 mb-8">
					React + Electrobun RPC
				</p>

				{/* Main Card */}
				<div className="bg-white rounded-xl shadow-xl p-6 mb-6">
					{/* Input */}
					<div className="flex gap-2 mb-6">
						<input
							type="text"
							id="new-todo"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && addTodo()}
							placeholder="添加新任务..."
							className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							onClick={addTodo}
							className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
						>
							添加
						</button>
					</div>

					{/* Filters */}
					<div className="flex gap-2 mb-6">
						{(["all", "active", "completed"] as FilterType[]).map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									filter === f
										? "bg-indigo-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{f === "all" ? "全部" : f === "active" ? "进行中" : "已完成"}
							</button>
						))}
					</div>

					{/* Todo List */}
					<ul id="todo-list" className="space-y-2 mb-6">
						{filteredTodos.length === 0 ? (
							<li className="text-center text-gray-400 py-8">暂无任务</li>
						) : (
							filteredTodos.map((todo) => (
								<li
									key={todo.id}
									className={`todo-item flex items-center gap-3 p-4 bg-gray-50 rounded-lg group ${
										todo.completed ? "completed" : ""
									}`}
								>
									<input
										type="checkbox"
										checked={todo.completed === 1}
										onChange={() => toggleTodo(todo.id)}
										className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
									/>
									<span
										className={`flex-1 todo-text ${
											todo.completed ? "line-through text-gray-400" : ""
										}`}
									>
										{todo.title}
									</span>
									<span className="text-sm text-gray-400 todo-date">
										{formatDate(todo.created_at)}
									</span>
									<button
										onClick={() => deleteTodo(todo.id)}
										className="delete-btn opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
									>
										&times;
									</button>
								</li>
							))
						)}
					</ul>

					{/* Stats & Clear */}
					<div className="flex items-center justify-between pt-4 border-t border-gray-200">
						<div id="stats" className="text-gray-600">
							{activeCount} 个待办，{stats.completed} 个已完成
						</div>
						<button
							onClick={clearCompleted}
							className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
						>
							清除已完成
						</button>
					</div>
				</div>

				{/* Info */}
				<div className="text-center text-white/80 text-sm">
					<p>使用 React + Electrobun RPC 构建</p>
				</div>
			</div>
		</div>
	);
}

export default App;
