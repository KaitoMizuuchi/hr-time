import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	basePath: "/api/auth",
	trustedOrigins: [process.env.BETTER_AUTH_TRUSTED_ORIGIN || "http://localhost:5173"],
	emailAndPassword: {
		enabled: true,
	},
})
