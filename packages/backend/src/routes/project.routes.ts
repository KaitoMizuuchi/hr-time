import { createProjectSchema, ERROR_CODES, updateProjectSchema } from "@hr-time/shared"
import { Hono } from "hono"
import { projectService } from "@/services/project.service"
import type { AppEnv } from "@/types/env"

const projectRoutes = new Hono<AppEnv>()

// GET /projects — 認証ユーザーのプロジェクト一覧
projectRoutes.get("/", async (c) => {
	const user = c.get("user")
	const projects = await projectService.getAll(user.id)
	return c.json({ success: true, data: projects })
})

// POST /projects — プロジェクト作成
projectRoutes.post("/", async (c) => {
	const user = c.get("user")
	const body = await c.req.json()
	const parsed = createProjectSchema.safeParse(body)

	if (!parsed.success) {
		return c.json(
			{
				success: false,
				error: {
					code: ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.issues[0].message,
				},
			},
			400,
		)
	}

	const result = await projectService.create(parsed.data, user.id)
	return c.json({ success: true, data: result.data }, 201)
})

// PATCH /projects/:id — プロジェクト更新
projectRoutes.patch("/:id", async (c) => {
	const user = c.get("user")
	const id = c.req.param("id")
	const body = await c.req.json()
	const parsed = updateProjectSchema.safeParse(body)

	if (!parsed.success) {
		return c.json(
			{
				success: false,
				error: {
					code: ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.issues[0].message,
				},
			},
			400,
		)
	}

	const result = await projectService.update(id, parsed.data, user.id)
	if ("error" in result) {
		return c.json({ success: false, error: result.error }, 404)
	}
	return c.json({ success: true, data: result.data })
})

// DELETE /projects/:id — プロジェクト削除
projectRoutes.delete("/:id", async (c) => {
	const user = c.get("user")
	const id = c.req.param("id")

	const result = await projectService.delete(id, user.id)
	if (result.error) {
		const status = result.error.code === ERROR_CODES.NOT_FOUND ? 404 : 409
		return c.json({ success: false, error: result.error }, status)
	}
	return c.json({ success: true, data: null })
})

export { projectRoutes }
