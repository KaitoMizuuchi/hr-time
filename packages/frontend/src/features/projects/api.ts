import type { CreateProjectInput, UpdateProjectInput } from "@hr-time/shared"
import { api } from "@/lib/apiClient"

type Project = {
	id: string
	name: string
	color: string
	userId: string
	createdAt: string
	updatedAt: string
}

type ApiResponse<T> = {
	success: boolean
	data: T
}

export const projectApi = {
	getAll: async (): Promise<ApiResponse<Project[]>> => {
		const res = await api.api.projects.$get()
		if (!res.ok) throw new Error("プロジェクトの取得に失敗しました")
		return (await res.json()) as ApiResponse<Project[]>
	},

	create: async (input: CreateProjectInput): Promise<ApiResponse<Project>> => {
		const res = await api.api.projects.$post({ json: input })
		if (!res.ok) throw new Error("プロジェクトの作成に失敗しました")
		return (await res.json()) as ApiResponse<Project>
	},

	update: async (id: string, input: UpdateProjectInput): Promise<ApiResponse<Project>> => {
		const res = await api.api.projects[":id"].$patch({
			param: { id },
			json: input,
		})
		if (!res.ok) throw new Error("プロジェクトの更新に失敗しました")
		return (await res.json()) as ApiResponse<Project>
	},

	delete: async (id: string): Promise<ApiResponse<null>> => {
		const res = await api.api.projects[":id"].$delete({
			param: { id },
		})
		if (!res.ok) throw new Error("プロジェクトの削除に失敗しました")
		return (await res.json()) as ApiResponse<null>
	},
}

export type { Project }
