import type { CreateProjectInput, UpdateProjectInput } from "@hr-time/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { projectApi } from "@/features/projects/api"

const PROJECTS_QUERY_KEY = ["projects"] as const

export const useProjects = () => {
	return useQuery({
		queryKey: PROJECTS_QUERY_KEY,
		queryFn: async () => {
			const res = await projectApi.getAll()
			return res.data
		},
	})
}

export const useCreateProject = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: CreateProjectInput) => projectApi.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
			toast.success("プロジェクトを作成しました")
		},
		onError: () => {
			toast.error("プロジェクトの作成に失敗しました")
		},
	})
}

export const useUpdateProject = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
			projectApi.update(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
			toast.success("プロジェクトを更新しました")
		},
		onError: () => {
			toast.error("プロジェクトの更新に失敗しました")
		},
	})
}

export const useDeleteProject = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => projectApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
			toast.success("プロジェクトを削除しました")
		},
		onError: () => {
			toast.error("プロジェクトの削除に失敗しました")
		},
	})
}
