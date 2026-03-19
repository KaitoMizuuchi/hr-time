import { describe, expect, it } from "vitest"
import app from "./index"

describe("認証ミドルウェア", () => {
	it("未認証で /api/health にアクセスすると401が返る", async () => {
		const res = await app.request("/api/health")
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED",
				message: "認証が必要です",
			},
		})
	})
})

describe("Better Auth ルート", () => {
	it("GET /api/auth/ok が200を返す（Better Authヘルスチェック）", async () => {
		const res = await app.request("/api/auth/ok")
		expect(res.status).toBe(200)
	})
})
