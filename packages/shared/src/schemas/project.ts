import { z } from "zod"
import { PROJECT_COLORS } from "../constants/colors"

export const createProjectSchema = z.object({
	name: z.string().min(1, "プロジェクト名は必須です"),
	color: z.enum(PROJECT_COLORS as unknown as [string, ...string[]]).optional(),
})

export const updateProjectSchema = z.object({
	name: z.string().min(1, "プロジェクト名は必須です").optional(),
	color: z.enum(PROJECT_COLORS as unknown as [string, ...string[]]).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
