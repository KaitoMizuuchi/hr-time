import type { CreateProjectInput, UpdateProjectInput } from "@hr-time/shared"
import { ERROR_CODES, PROJECT_COLORS } from "@hr-time/shared"
import { projectRepository } from "@/repositories/project.repository"

export const projectService = {
	getAll: (userId: string) => {
		return projectRepository.findAllByUserId(userId)
	},

	getById: async (id: string, userId: string) => {
		const project = await projectRepository.findById(id, userId)
		if (!project) {
			return { error: { code: ERROR_CODES.NOT_FOUND, message: "プロジェクトが見つかりません" } }
		}
		return { data: project }
	},

	create: async (input: CreateProjectInput, userId: string) => {
		const count = await projectRepository.countByUserId(userId)
		const color = input.color ?? PROJECT_COLORS[count % PROJECT_COLORS.length]

		const project = await projectRepository.create({
			name: input.name,
			color,
			userId,
		})
		return { data: project }
	},

	update: async (id: string, input: UpdateProjectInput, userId: string) => {
		const existing = await projectRepository.findById(id, userId)
		if (!existing) {
			return { error: { code: ERROR_CODES.NOT_FOUND, message: "プロジェクトが見つかりません" } }
		}

		const project = await projectRepository.update(id, input)
		return { data: project }
	},

	delete: async (id: string, userId: string) => {
		const existing = await projectRepository.findById(id, userId)
		if (!existing) {
			return { error: { code: ERROR_CODES.NOT_FOUND, message: "プロジェクトが見つかりません" } }
		}

		await projectRepository.delete(id)
		return { data: null }
	},
}
