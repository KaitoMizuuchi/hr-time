import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectCreate } from "@/components/ui/SelectCreate"
import { useCreateProject, useProjects } from "@/features/projects/hooks/useProjects"

type TaskAddModalProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const TaskAddModal = ({ open, onOpenChange }: TaskAddModalProps) => {
	const [taskName, setTaskName] = useState("")
	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

	const { data: projects } = useProjects()
	const createProject = useCreateProject()

	const projectItems = (projects ?? []).map((p) => ({
		value: p.id,
		label: p.name,
	}))

	const handleCreateProject = (name: string) => {
		createProject.mutate(
			{ name },
			{
				onSuccess: (res) => {
					if (res.data) {
						setSelectedProjectId(res.data.id)
					}
				},
			},
		)
	}

	const handleClose = () => {
		onOpenChange(false)
		setTaskName("")
		setSelectedProjectId(null)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) handleClose()
			}}
		>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle>タスクを追加</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4 py-4">
					<div>
						<label htmlFor="task-name" className="mb-1.5 block font-medium text-sm">
							タスク名
						</label>
						<Input
							id="task-name"
							value={taskName}
							onChange={(e) => setTaskName(e.target.value)}
							placeholder="タスク名を入力"
							autoFocus
						/>
					</div>
					<div>
						<span className="mb-1.5 block font-medium text-sm">プロジェクト</span>
						<SelectCreate
							items={projectItems}
							value={selectedProjectId}
							onSelect={setSelectedProjectId}
							onCreate={handleCreateProject}
							placeholder="プロジェクトを選択..."
							searchPlaceholder="プロジェクトを検索..."
							isCreating={createProject.isPending}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose}>
						キャンセル
					</Button>
					<Button
						type="button"
						disabled={!taskName.trim()}
						onClick={() => {
							// Note: タスクのAPI保存はStory 2.2で実装
							handleClose()
						}}
					>
						追加
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
