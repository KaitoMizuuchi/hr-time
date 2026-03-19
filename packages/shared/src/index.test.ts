import { expect, test } from "vitest"

test("shared module is importable", async () => {
	const shared = await import("./index")
	expect(shared).toBeDefined()
})
