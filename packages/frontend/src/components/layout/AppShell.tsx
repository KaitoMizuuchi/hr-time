import { Outlet } from "react-router"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppShell() {
	return (
		<SidebarProvider defaultOpen={false}>
			<TooltipProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-12 items-center border-b px-4">
						<SidebarTrigger aria-label="サイドバーの開閉" />
					</header>
					<main className="flex-1 overflow-auto">
						<Outlet />
					</main>
				</SidebarInset>
			</TooltipProvider>
		</SidebarProvider>
	)
}
