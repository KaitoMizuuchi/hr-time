import { ERROR_CODES } from "@hr-time/shared"
import type { Context, Next } from "hono"
import { auth } from "@/lib/auth"

export const authMiddleware = async (c: Context, next: Next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})
	if (!session) {
		return c.json(
			{
				success: false,
				error: { code: ERROR_CODES.UNAUTHORIZED, message: "認証が必要です" },
			},
			401,
		)
	}
	c.set("user", session.user)
	c.set("session", session.session)
	await next()
}
