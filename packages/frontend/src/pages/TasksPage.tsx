import { ClipboardList } from "lucide-react"

export const TasksPage = () => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center p-8">
			<ClipboardList className="mb-4 size-12 text-muted-foreground/50" />
			<h1 className="text-xl font-semibold">タスク</h1>
			<p className="mt-2 text-muted-foreground">タスクを追加して始めましょう</p>
		</div>
	)
}
