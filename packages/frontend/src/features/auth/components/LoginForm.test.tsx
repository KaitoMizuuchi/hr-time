import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { LoginForm } from "./LoginForm"

vi.mock("react-router", () => ({
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
	useNavigate: () => vi.fn(),
}))

vi.mock("@/lib/authClient", () => ({
	authClient: {
		useSession: () => ({ data: null, isPending: false }),
		signIn: { email: vi.fn() },
	},
}))

describe("LoginForm", () => {
	const getSubmitButton = () =>
		screen.getAllByRole("button").find((el) => el.getAttribute("type") === "submit")!

	it("メール・パスワードフィールドとログインボタンが表示される", () => {
		render(<LoginForm />)
		expect(screen.getByLabelText("メールアドレス")).toBeDefined()
		expect(screen.getByLabelText("パスワード")).toBeDefined()
		expect(getSubmitButton()).toBeDefined()
	})

	it("未入力時はログインボタンが非アクティブ", () => {
		render(<LoginForm />)
		expect(getSubmitButton().hasAttribute("disabled")).toBe(true)
	})

	it("無効なメール入力でバリデーションエラーが表示される", async () => {
		const user = userEvent.setup()
		render(<LoginForm />)

		await user.type(screen.getByLabelText("メールアドレス"), "invalid")
		await user.tab()

		expect(await screen.findByText("有効なメールアドレスを入力してください")).toBeDefined()
	})

	it("サインアップリンクが表示される", () => {
		render(<LoginForm />)
		const links = screen.getAllByText("サインアップ")
		const signupLink = links.find((el) => el.closest("a"))
		expect(signupLink?.closest("a")?.getAttribute("href")).toBe("/signup")
	})
})
