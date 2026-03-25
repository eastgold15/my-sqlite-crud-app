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

	async function closeWindow() {
		await electrobun.rpc!.request.closeWindow({});
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
		<div className="bg-white w-full h-screen flex flex-col overflow-hidden">
			{/* 顶部导航栏 - 固定 */}
			<div className="electrobun-webkit-app-region-drag bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0 h-12">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-red-400"></div>
					<div className="w-3 h-3 rounded-full bg-yellow-400"></div>
					<div className="w-3 h-3 rounded-full bg-green-400"></div>
				</div>
				<button
					onClick={closeWindow}
					className="electrobun-webkit-app-region-no-drag w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{/* 中间内容区域 - 可滚动 */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-6">
					{/* 标题 */}
					<h1 className="text-xl font-bold text-gray-900 mb-4 text-center">
						Todo App
					</h1>

					{/* 输入框 */}
					<div className="flex gap-2 mb-4">
						<input
							type="text"
							id="new-todo"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && addTodo()}
							placeholder="添加新任务..."
							className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
						/>
						<button
							onClick={addTodo}
							className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
						>
							添加
						</button>
					</div>

					{/* 筛选按钮 */}
					<div className="flex gap-2 mb-4">
						{(["all", "active", "completed"] as FilterType[]).map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
									filter === f
										? "bg-indigo-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{f === "all" ? "全部" : f === "active" ? "进行中" : "已完成"}
							</button>
						))}
					</div>

					{/* Todo 列表 */}
					<ul id="todo-list" className="space-y-2">
						{filteredTodos.length === 0 ? (
							<li className="text-center text-gray-400 py-8">暂无任务</li>
						) : (
							filteredTodos.map((todo) => (
								<li
									key={todo.id}
									className={`todo-item flex items-center gap-3 p-3 bg-gray-50 rounded-lg group ${
										todo.completed ? "completed" : ""
									}`}
								>
									<input
										type="checkbox"
										checked={todo.completed === 1}
										onChange={() => toggleTodo(todo.id)}
										className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
									/>
									<span
										className={`flex-1 todo-text text-sm ${
											todo.completed ? "line-through text-gray-400" : "text-gray-700"
										}`}
									>
										{todo.title}
									</span>
									<span className="text-xs text-gray-400 todo-date shrink-0">
										{formatDate(todo.created_at)}
									</span>
									<button
										onClick={() => deleteTodo(todo.id)}
										className="delete-btn opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity shrink-0"
									>
										&times;
									</button>
								</li>
							))
						)}
					</ul>
				</div>
				{/* 底部留白，防止内容被底部栏遮挡 */}
				<div className="h-16"></div>
			</div>

			{/* 底部统计栏 - 固定 */}
			<div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm bg-white h-16">
				<div id="stats" className="text-gray-600">
					{activeCount} 个待办，{stats.completed} 个已完成
				</div>
				<button
					onClick={clearCompleted}
					className="px-3 py-1.5 text-red-600 hover:text-red-700 font-medium transition-colors"
				>
					清除已完成
				</button>
			</div>
		</div>
	);
}

export default App;
