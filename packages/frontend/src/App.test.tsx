import { expect, test } from "vitest"
import { App } from "./App"

test("App component is defined", () => {
	expect(App).toBeDefined()
	expect(typeof App).toBe("function")
})
