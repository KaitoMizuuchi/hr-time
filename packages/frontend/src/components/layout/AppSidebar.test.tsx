import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./AppSidebar"

beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	})
})

vi.mock("@/features/auth/hooks/useAuth", () => ({
	useAuth: () => ({
		user: { id: "1", name: "Test User", email: "test@example.com" },
		isAuthenticated: true,
		isPending: false,
		signUp: vi.fn(),
		signIn: vi.fn(),
		signOut: vi.fn(),
	}),
}))

const renderSidebar = (initialPath = "/tasks") => {
	return render(
		<MemoryRouter initialEntries={[initialPath]}>
			<SidebarProvider defaultOpen={true}>
				<TooltipProvider>
					<AppSidebar />
				</TooltipProvider>
			</SidebarProvider>
		</MemoryRouter>,
	)
}

describe("AppSidebar", () => {
	it("タスクとダッシュボードのナビゲーション項目が表示される", () => {
		renderSidebar()
		expect(screen.getAllByText("タスク").length).toBeGreaterThanOrEqual(1)
		expect(screen.getAllByText("ダッシュボード").length).toBeGreaterThanOrEqual(1)
	})

	it("ログアウトボタンが表示される", () => {
		renderSidebar()
		expect(screen.getAllByText("ログアウト").length).toBeGreaterThanOrEqual(1)
	})

	it("タスク画面でタスクのナビゲーション項目がアクティブになる", () => {
		renderSidebar("/tasks")
		const taskButtons = screen.getAllByText("タスク")
		const activeButton = taskButtons.find(
			(el) => el.closest("button")?.getAttribute("aria-current") === "page",
		)
		expect(activeButton).toBeDefined()
	})

	it("ダッシュボード画面でダッシュボードのナビゲーション項目がアクティブになる", () => {
		renderSidebar("/dashboard")
		const dashboardButtons = screen.getAllByText("ダッシュボード")
		const activeButton = dashboardButtons.find(
			(el) => el.closest("button")?.getAttribute("aria-current") === "page",
		)
		expect(activeButton).toBeDefined()
	})

	it("ナビゲーション項目をクリックできる", async () => {
		const user = userEvent.setup()
		renderSidebar("/tasks")
		const dashboardButtons = screen.getAllByText("ダッシュボード")
		const button = dashboardButtons[0].closest("button")
		if (button) {
			await user.click(button)
		}
	})
})
