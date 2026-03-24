import { Hono } from "hono"
import { logger } from "hono/logger"
import { auth } from "./lib/auth"
import { authMiddleware } from "./middleware/auth"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler"
import { projectRoutes } from "./routes/project.routes"

const app = new Hono()

// グローバルミドルウェア
app.use("*", logger())

// Better Auth ルート（認証不要）
app.on(["POST", "GET"], "/api/auth/**", (c) => {
	return auth.handler(c.req.raw)
})

// 認証が必要なAPIルート
const api = new Hono()
api.use("*", authMiddleware)
api.get("/health", (c) => {
	return c.json({ success: true, data: { status: "ok" } })
})
api.route("/projects", projectRoutes)
app.route("/api", api)

// エラーハンドリング
app.onError(errorHandler)
app.notFound(notFoundHandler)

export default app

export type AppType = typeof app
