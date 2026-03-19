import { BrowserRouter } from "react-router"
import { Toaster } from "@/components/ui/toaster"
import { AppRoutes } from "@/routes"

export function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
			<Toaster />
		</BrowserRouter>
	)
}
