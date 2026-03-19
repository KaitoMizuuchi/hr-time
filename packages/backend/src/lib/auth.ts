import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	basePath: "/api/auth",
	emailAndPassword: {
		enabled: true,
	},
})
