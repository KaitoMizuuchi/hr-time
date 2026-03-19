import type { AppType } from "@hr-time/backend"
import { hc } from "hono/client"

export const api = hc<AppType>("/")
