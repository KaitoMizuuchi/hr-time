import { ERROR_CODES } from "@hr-time/shared"
import type { ErrorHandler, NotFoundHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export const errorHandler: ErrorHandler = (err, c) => {
	console.error(err)
	const status = ("status" in err ? err.status : 500) as ContentfulStatusCode
	return c.json(
		{
			success: false as const,
			error: {
				code: ERROR_CODES.INTERNAL_ERROR,
				message: "サーバーエラーが発生しました",
			},
		},
		status,
	)
}

export const notFoundHandler: NotFoundHandler = (c) => {
	return c.json(
		{
			success: false as const,
			error: {
				code: ERROR_CODES.NOT_FOUND,
				message: "リソースが見つかりません",
			},
		},
		404,
	)
}
