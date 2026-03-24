import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { SelectCreate } from "./SelectCreate"

beforeAll(() => {
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	Element.prototype.scrollIntoView = vi.fn()
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

const items = [
	{ value: "1", label: "Project Alpha" },
	{ value: "2", label: "Project Beta" },
	{ value: "3", label: "Project Gamma" },
]

const getPopoverTrigger = () =>
	screen.getAllByRole("button").find((el) => el.getAttribute("data-slot") === "popover-trigger")!

describe("SelectCreate", () => {
	it("プレースホルダーが表示される", () => {
		render(
			<SelectCreate
				items={items}
				value={null}
				onSelect={vi.fn()}
				onCreate={vi.fn()}
				placeholder="プロジェクトを選択..."
			/>,
		)
		expect(screen.getByText("プロジェクトを選択...")).toBeDefined()
	})

	it("選択済みアイテムのラベルが表示される", () => {
		render(<SelectCreate items={items} value="2" onSelect={vi.fn()} onCreate={vi.fn()} />)
		expect(screen.getAllByText("Project Beta").length).toBeGreaterThan(0)
	})

	it("ドロップダウンを開くとアイテム一覧が表示される", async () => {
		const user = userEvent.setup()
		render(<SelectCreate items={items} value={null} onSelect={vi.fn()} onCreate={vi.fn()} />)

		await user.click(getPopoverTrigger())

		expect(screen.getAllByText("Project Alpha").length).toBeGreaterThan(0)
		expect(screen.getAllByText("Project Beta").length).toBeGreaterThan(0)
		expect(screen.getAllByText("Project Gamma").length).toBeGreaterThan(0)
	})
})
