import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			staleTime: 1000 * 60,
		},
		mutations: {
			onError: (error: Error) => {
				if ("status" in error && (error as unknown as { status: number }).status === 401) {
					window.location.href = "/login"
				}
			},
		},
	},
})
