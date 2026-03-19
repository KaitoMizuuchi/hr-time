import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/features/auth/hooks/useAuth"

export const ProtectedRoute = () => {
	const { isAuthenticated, isPending } = useAuth()

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">読み込み中...</p>
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
