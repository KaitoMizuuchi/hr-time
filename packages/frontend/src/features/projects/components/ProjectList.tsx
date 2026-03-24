import { ClipboardList } from "lucide-react"
import { ProjectGroup } from "@/features/projects/components/ProjectGroup"
import { useProjects } from "@/features/projects/hooks/useProjects"

export const ProjectList = () => {
	const { data: projects, isPending, isError } = useProjects()

	if (isPending) {
		return (
			<div className="flex items-center justify-center p-8">
				<p className="text-muted-foreground text-sm">読み込み中...</p>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center p-8">
				<p className="text-destructive text-sm">プロジェクトの読み込みに失敗しました</p>
			</div>
		)
	}

	if (!projects || projects.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<ClipboardList className="mb-2 size-8 text-muted-foreground/50" />
				<p className="text-muted-foreground text-sm">タスクを追加して始めましょう</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col">
			{projects.map((project) => (
				<ProjectGroup key={project.id} project={project} />
			))}
		</div>
	)
}
