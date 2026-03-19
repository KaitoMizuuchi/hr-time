import { BrowserRouter } from "react-router"
import { Toaster } from "@/components/ui/toaster"
import { AppRoutes } from "@/routes"

export const App = () => {
	return (
		<BrowserRouter>
			<AppRoutes />
			<Toaster />
		</BrowserRouter>
	)
}
