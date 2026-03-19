import { Navigate, Route, Routes } from "react-router"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"
import { TasksPage } from "@/pages/TasksPage"
import { ProtectedRoute } from "./ProtectedRoute"

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/tasks" element={<TasksPage />} />
				<Route path="/dashboard" element={<DashboardPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	)
}
