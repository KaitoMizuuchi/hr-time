import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteProject } from "@/features/projects/hooks/useProjects"

type ProjectDeleteDialogProps = {
	project: { id: string; name: string }
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const ProjectDeleteDialog = ({ project, open, onOpenChange }: ProjectDeleteDialogProps) => {
	const deleteProject = useDeleteProject()

	const handleDelete = () => {
		deleteProject.mutate(project.id, {
			onSuccess: () => onOpenChange(false),
		})
	}

	return (
		<Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>プロジェクトを削除</DialogTitle>
					<DialogDescription>
						「{project.name}」を削除しますか？この操作は元に戻せません。
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						キャンセル
					</Button>
					<Button variant="destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
						削除
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
