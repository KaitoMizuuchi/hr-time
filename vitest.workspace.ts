import { defineConfig } from "vitest/config"

export default [
	defineConfig({
		resolve: {
			alias: {
				"@/": new URL("./packages/frontend/src/", import.meta.url).pathname,
			},
		},
		test: {
			name: "frontend",
			root: "./packages/frontend",
			environment: "jsdom",
			include: ["src/**/*.test.{ts,tsx}"],
		},
	}),
	defineConfig({
		test: {
			name: "backend",
			root: "./packages/backend",
			include: ["src/**/*.test.ts"],
		},
	}),
	defineConfig({
		test: {
			name: "shared",
			root: "./packages/shared",
			include: ["src/**/*.test.ts"],
		},
	}),
]
