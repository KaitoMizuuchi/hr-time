export type AppEnv = {
	Variables: {
		user: { id: string; name: string; email: string }
		session: { id: string; userId: string; expiresAt: Date }
	}
}
