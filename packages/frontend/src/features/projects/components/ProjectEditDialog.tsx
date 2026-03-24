import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUpdateProject } from "@/features/projects/hooks/useProjects"

type ProjectEditDialogProps = {
	project: { id: string; name: string }
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const ProjectEditDialog = ({ project, open, onOpenChange }: ProjectEditDialogProps) => {
	const [name, setName] = useState(project.name)
	const updateProject = useUpdateProject()

	useEffect(() => {
		if (open) setName(project.name)
	}, [open, project.name])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return

		updateProject.mutate(
			{ id: project.id, input: { name: name.trim() } },
			{ onSuccess: () => onOpenChange(false) },
		)
	}

	return (
		<Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>プロジェクトを編集</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="py-4">
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="プロジェクト名"
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							キャンセル
						</Button>
						<Button type="submit" disabled={!name.trim() || updateProject.isPending}>
							保存
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
