import { Hono } from "hono"
import { describe, expect, it } from "vitest"
import { errorHandler, notFoundHandler } from "./errorHandler"

describe("errorHandler", () => {
	const app = new Hono()
	app.get("/error", () => {
		throw new Error("テストエラー")
	})
	app.onError(errorHandler)
	app.notFound(notFoundHandler)

	it("500エラーを統一フォーマットで返す", async () => {
		const res = await app.request("/error")
		expect(res.status).toBe(500)
		const body = await res.json()
		expect(body).toEqual({
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "サーバーエラーが発生しました",
			},
		})
	})

	it("存在しないパスで404を統一フォーマットで返す", async () => {
		const res = await app.request("/nonexistent")
		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND",
				message: "リソースが見つかりません",
			},
		})
	})
})
