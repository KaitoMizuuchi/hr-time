import { afterAll, beforeAll, describe, expect, it } from "vitest"
import app from "../index"
import { prisma } from "./db"

const testEmail = `test-${Date.now()}@example.com`
const testPassword = "password123"
const testName = "テストユーザー"

describe("認証API インテグレーションテスト", () => {
	beforeAll(async () => {
		await prisma.$connect()
	})

	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } })
		await prisma.$disconnect()
	})

	it("POST /api/auth/sign-up/email でアカウントが作成される", async () => {
		const res = await app.request("/api/auth/sign-up/email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: testName,
				email: testEmail,
				password: testPassword,
			}),
		})
		expect(res.status).toBe(200)

		const body = (await res.json()) as { user?: { email: string; name: string } }
		expect(body.user).toBeDefined()
		expect(body.user?.email).toBe(testEmail)
		expect(body.user?.name).toBe(testName)

		// DBにユーザーが作成されていることを確認
		const user = await prisma.user.findUnique({ where: { email: testEmail } })
		expect(user).not.toBeNull()
		expect(user?.name).toBe(testName)
	})

	it("POST /api/auth/sign-in/email でログインできる", async () => {
		const res = await app.request("/api/auth/sign-in/email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: testEmail,
				password: testPassword,
			}),
		})
		expect(res.status).toBe(200)

		const body = (await res.json()) as { user?: { email: string }; session?: unknown }
		expect(body.user).toBeDefined()
		expect(body.user?.email).toBe(testEmail)
	})

	it("同じメールで再サインアップするとエラーになる", async () => {
		const res = await app.request("/api/auth/sign-up/email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: testName,
				email: testEmail,
				password: testPassword,
			}),
		})
		// Better Authは重複メールでエラーを返す
		expect(res.status).not.toBe(200)
	})
})
