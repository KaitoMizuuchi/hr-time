import { ERROR_CODES, PROJECT_COLORS } from "@hr-time/shared"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { projectService } from "./project.service"

// Mock repository
vi.mock("@/repositories/project.repository", () => ({
	projectRepository: {
		findAllByUserId: vi.fn(),
		findById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		countByUserId: vi.fn(),
	},
}))

import { projectRepository } from "@/repositories/project.repository"

const mockRepo = vi.mocked(projectRepository)

const userId = "user-1"

describe("projectService", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("getAll", () => {
		it("ユーザーの全プロジェクトを取得する", async () => {
			const projects = [
				{
					id: "p1",
					name: "Project A",
					color: "#93C5FD",
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]
			mockRepo.findAllByUserId.mockResolvedValue(projects)

			const result = await projectService.getAll(userId)
			expect(result).toEqual(projects)
			expect(mockRepo.findAllByUserId).toHaveBeenCalledWith(userId)
		})
	})

	describe("getById", () => {
		it("存在するプロジェクトを取得する", async () => {
			const project = {
				id: "p1",
				name: "Project A",
				color: "#93C5FD",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			mockRepo.findById.mockResolvedValue(project)

			const result = await projectService.getById("p1", userId)
			expect(result).toEqual({ data: project })
		})

		it("存在しないプロジェクトでNOT_FOUNDエラーを返す", async () => {
			mockRepo.findById.mockResolvedValue(null)

			const result = await projectService.getById("non-existent", userId)
			expect(result).toEqual({
				error: { code: ERROR_CODES.NOT_FOUND, message: "プロジェクトが見つかりません" },
			})
		})
	})

	describe("create", () => {
		it("カラー指定なしで自動割り当てする", async () => {
			mockRepo.countByUserId.mockResolvedValue(0)
			mockRepo.create.mockResolvedValue({
				id: "p1",
				name: "New Project",
				color: PROJECT_COLORS[0],
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})

			const result = await projectService.create({ name: "New Project" }, userId)
			expect(mockRepo.create).toHaveBeenCalledWith({
				name: "New Project",
				color: PROJECT_COLORS[0],
				userId,
			})
			expect(result.data).toBeDefined()
		})

		it("カラー指定ありでそのカラーを使用する", async () => {
			mockRepo.countByUserId.mockResolvedValue(0)
			mockRepo.create.mockResolvedValue({
				id: "p1",
				name: "New Project",
				color: "#FCA5A5",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})

			await projectService.create({ name: "New Project", color: "#FCA5A5" }, userId)
			expect(mockRepo.create).toHaveBeenCalledWith({
				name: "New Project",
				color: "#FCA5A5",
				userId,
			})
		})

		it("カラーがパレットを循環する", async () => {
			mockRepo.countByUserId.mockResolvedValue(PROJECT_COLORS.length + 2)
			mockRepo.create.mockResolvedValue({
				id: "p1",
				name: "Test",
				color: PROJECT_COLORS[2],
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})

			await projectService.create({ name: "Test" }, userId)
			expect(mockRepo.create).toHaveBeenCalledWith({
				name: "Test",
				color: PROJECT_COLORS[2],
				userId,
			})
		})
	})

	describe("update", () => {
		it("存在するプロジェクトを更新する", async () => {
			const existing = {
				id: "p1",
				name: "Old Name",
				color: "#93C5FD",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			const updated = { ...existing, name: "New Name" }
			mockRepo.findById.mockResolvedValue(existing)
			mockRepo.update.mockResolvedValue(updated)

			const result = await projectService.update("p1", { name: "New Name" }, userId)
			expect(result).toEqual({ data: updated })
		})

		it("存在しないプロジェクト更新でNOT_FOUNDエラーを返す", async () => {
			mockRepo.findById.mockResolvedValue(null)

			const result = await projectService.update("non-existent", { name: "New" }, userId)
			expect(result).toEqual({
				error: { code: ERROR_CODES.NOT_FOUND, message: "プロジェクトが見つかりません" },
			})
		})
	})

	describe("delete", () => {
		it("存在するプロジェクトを削除する", async () => {
			const existing = {
				id: "p1",
				name: "Project",
				color: "#93C5FD",
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			mockRepo.findById.mockResolvedValue(existing)
			mockRepo.delete.mockResolvedValue(existing)

			const result = await projectService.delete("p1", userId)
			expect(result).toEqual({ data: null })
			expect(mockRepo.delete).toHaveBeenCalledWith("p1")
		})

		it("存在しないプロジェクト削除でNOT_FOUNDエラーを返す", async () => {
			mockRepo.findById.mockResolvedValue(null)

			const result = await projectService.delete("non-existent", userId)
			expect(result).toEqual({
				error: { code: ERROR_CODES.NOT_FOUND, message: "プロジェクトが見つかりません" },
			})
			expect(mockRepo.delete).not.toHaveBeenCalled()
		})
	})
})
