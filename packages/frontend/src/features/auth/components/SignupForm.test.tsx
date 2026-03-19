import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SignupForm } from "./SignupForm"

vi.mock("react-router", () => ({
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
	useNavigate: () => vi.fn(),
}))

vi.mock("@/lib/authClient", () => ({
	authClient: {
		useSession: () => ({ data: null, isPending: false }),
		signUp: { email: vi.fn() },
	},
}))

describe("SignupForm", () => {
	const getSubmitButton = () =>
		screen.getAllByRole("button").find((el) => el.getAttribute("type") === "submit")!

	it("全フィールドとサインアップボタンが表示される", () => {
		render(<SignupForm />)
		expect(screen.getByLabelText("表示名")).toBeDefined()
		expect(screen.getByLabelText("メールアドレス")).toBeDefined()
		expect(screen.getByLabelText("パスワード")).toBeDefined()
		expect(screen.getByLabelText("確認パスワード")).toBeDefined()
		expect(getSubmitButton()).toBeDefined()
	})

	it("未入力時はサインアップボタンが非アクティブ", () => {
		render(<SignupForm />)
		expect(getSubmitButton().hasAttribute("disabled")).toBe(true)
	})

	it("パスワード不一致でバリデーションエラーが表示される", async () => {
		const user = userEvent.setup()
		render(<SignupForm />)

		await user.type(screen.getByLabelText("表示名"), "テスト")
		await user.type(screen.getByLabelText("メールアドレス"), "test@example.com")
		await user.type(screen.getByLabelText("パスワード"), "password123")
		await user.type(screen.getByLabelText("確認パスワード"), "different")
		await user.tab()

		expect(await screen.findByText("パスワードが一致しません")).toBeDefined()
	})

	it("ログインリンクが表示される", () => {
		render(<SignupForm />)
		const links = screen.getAllByText("ログイン")
		const loginLink = links.find((el) => el.closest("a"))
		expect(loginLink?.closest("a")?.getAttribute("href")).toBe("/login")
	})
})
