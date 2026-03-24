import { ClipboardList, LayoutDashboard, Loader2, LogOut } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/hooks/useAuth"

const NAV_ITEMS = [
	{ path: "/tasks", label: "タスク", icon: ClipboardList },
	{ path: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
] as const

export function AppSidebar() {
	const location = useLocation()
	const navigate = useNavigate()
	const { signOut } = useAuth()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const handleSignOut = async () => {
		setIsSigningOut(true)
		try {
			await signOut()
		} finally {
			setIsSigningOut(false)
		}
	}

	return (
		<Sidebar collapsible="icon" aria-label="メインナビゲーション">
			<SidebarContent className="p-2 transition-[padding] duration-200 group-data-[collapsible=icon]:px-3">
				<SidebarMenu className="gap-1">
					{NAV_ITEMS.map((item) => {
						const isActive = location.pathname === item.path
						return (
							<SidebarMenuItem key={item.path}>
								<SidebarMenuButton
									onClick={() => navigate(item.path)}
									isActive={isActive}
									tooltip={item.label}
									className={
										isActive
											? "bg-sky-100 text-sky-500 hover:bg-sky-100 hover:text-sky-500 data-active:bg-sky-100 data-active:text-sky-500"
											: ""
									}
									aria-current={isActive ? "page" : undefined}
								>
									<item.icon className={isActive ? "text-sky-500" : ""} />
									<span>{item.label}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					})}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter className="transition-[padding] duration-200 group-data-[collapsible=icon]:px-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={handleSignOut}
							disabled={isSigningOut}
							tooltip="ログアウト"
							aria-label="ログアウト"
						>
							{isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut />}
							<span>ログアウト</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
