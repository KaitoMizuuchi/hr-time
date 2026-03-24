import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { AppShell } from "./AppShell"

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

const renderAppShell = (initialPath = "/tasks") => {
	return render(
		<MemoryRouter initialEntries={[initialPath]}>
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/tasks" element={<div data-testid="tasks-page">タスクページ</div>} />
					<Route
						path="/dashboard"
						element={<div data-testid="dashboard-page">ダッシュボードページ</div>}
					/>
				</Route>
			</Routes>
		</MemoryRouter>,
	)
}

describe("AppShell", () => {
	it("セマンティックなmain要素が存在する", () => {
		renderAppShell()
		const mainElements = screen.getAllByRole("main")
		expect(mainElements.length).toBeGreaterThanOrEqual(1)
	})

	it("サイドバートグルボタンが表示される", () => {
		renderAppShell()
		const toggleButtons = screen.getAllByRole("button", { name: "サイドバーの開閉" })
		expect(toggleButtons.length).toBeGreaterThanOrEqual(1)
	})

	it("子ルートのコンテンツがレンダリングされる", () => {
		renderAppShell("/tasks")
		const pages = screen.getAllByTestId("tasks-page")
		expect(pages.length).toBeGreaterThanOrEqual(1)
	})

	it("ダッシュボードルートが正しくレンダリングされる", () => {
		renderAppShell("/dashboard")
		const pages = screen.getAllByTestId("dashboard-page")
		expect(pages.length).toBeGreaterThanOrEqual(1)
	})
})
