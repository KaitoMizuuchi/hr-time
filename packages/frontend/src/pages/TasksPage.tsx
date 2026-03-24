import { Clock, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/features/projects/components/ProjectList"
import { TaskAddModal } from "@/features/tasks/components/TaskAddModal"

export const TasksPage = () => {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)

	return (
		<div className="flex h-full">
			{/* 左カラム: Todoリスト */}
			<div className="flex w-[300px] shrink-0 flex-col border-r">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h2 className="font-semibold text-sm">Todo</h2>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => setIsAddModalOpen(true)}
						aria-label="タスクを追加"
					>
						<Plus className="size-4" />
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto">
					<ProjectList />
				</div>
			</div>

			{/* 右カラム: タイムライン（プレースホルダー） */}
			<div className="flex flex-1 flex-col items-center justify-center p-8">
				<Clock className="mb-4 size-12 text-muted-foreground/50" />
				<p className="text-muted-foreground">タイムラインはEpic 3で実装予定です</p>
			</div>

			<TaskAddModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
		</div>
	)
}
