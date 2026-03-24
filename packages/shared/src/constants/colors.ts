export const PROJECT_COLORS = [
	"#93C5FD", // blue-300
	"#86EFAC", // green-300
	"#FCA5A5", // red-300
	"#FCD34D", // amber-300
	"#C4B5FD", // violet-300
	"#67E8F9", // cyan-300
	"#FDBA74", // orange-300
	"#F0ABFC", // fuchsia-300
	"#6EE7B7", // emerald-300
	"#FDA4AF", // rose-300
] as const

export type ProjectColor = (typeof PROJECT_COLORS)[number]
