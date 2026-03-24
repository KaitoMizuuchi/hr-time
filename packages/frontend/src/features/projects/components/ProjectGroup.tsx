import { ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/features/projects/api"
import { ProjectDeleteDialog } from "@/features/projects/components/ProjectDeleteDialog"
import { ProjectEditDialog } from "@/features/projects/components/ProjectEditDialog"

type ProjectGroupProps = {
	project: Project
}

export const ProjectGroup = ({ project }: ProjectGroupProps) => {
	const [isExpanded, setIsExpanded] = useState(true)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	return (
		<div className="border-b last:border-b-0">
			<div className="flex items-center gap-2 px-3 py-2">
				<button
					type="button"
					className="flex items-center gap-2 flex-1 text-left"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					{isExpanded ? (
						<ChevronDown className="size-3.5 text-muted-foreground" />
					) : (
						<ChevronRight className="size-3.5 text-muted-foreground" />
					)}
					<span
						className="size-2.5 rounded-full shrink-0"
						style={{ backgroundColor: project.color }}
					/>
					<span className="font-medium text-sm truncate">{project.name}</span>
				</button>

				<DropdownMenu>
					<DropdownMenuTrigger className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent">
						<MoreHorizontal className="size-3.5" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setIsEditOpen(true)}>
							<Pencil className="mr-2 size-3.5" />
							編集
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setIsDeleteOpen(true)} variant="destructive">
							<Trash2 className="mr-2 size-3.5" />
							削除
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{isExpanded && (
				<div className="px-3 pb-2 pl-9">
					<p className="text-muted-foreground text-xs">タスクはまだありません</p>
				</div>
			)}

			<ProjectEditDialog project={project} open={isEditOpen} onOpenChange={setIsEditOpen} />
			<ProjectDeleteDialog project={project} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
		</div>
	)
}
