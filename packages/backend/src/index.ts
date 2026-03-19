import { Hono } from "hono"
import { logger } from "hono/logger"

const app = new Hono()

app.use("*", logger())

app.get("/api/health", (c) => {
	return c.json({ success: true, data: { status: "ok" } })
})

export default app

export type AppType = typeof app
