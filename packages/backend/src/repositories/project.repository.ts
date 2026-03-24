import { prisma } from "@/lib/db"

export const projectRepository = {
	findAllByUserId: (userId: string) => {
		return prisma.project.findMany({
			where: { userId },
			orderBy: { createdAt: "asc" },
		})
	},

	findById: (id: string, userId: string) => {
		return prisma.project.findFirst({
			where: { id, userId },
		})
	},

	create: (data: { name: string; color: string; userId: string }) => {
		return prisma.project.create({ data })
	},

	update: (id: string, data: { name?: string; color?: string }) => {
		return prisma.project.update({
			where: { id },
			data,
		})
	},

	delete: (id: string) => {
		return prisma.project.delete({
			where: { id },
		})
	},

	countByUserId: (userId: string) => {
		return prisma.project.count({ where: { userId } })
	},
}
