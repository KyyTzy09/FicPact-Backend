import { Hono } from "hono";
import { FolderService } from "./folder.service.js";
import { FolderRepository } from "./folder.repository.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { createFolderValidation, updateFolderValidation } from "./folder.validation.js";
import { describeRoute, validator } from "hono-openapi";

const folderRepository = new FolderRepository()
const folderService = new FolderService(folderRepository)
export const folderController = new Hono()
    .get("/",
        describeRoute({
            tags: ["Folder"],
            summary: "Get User Quest Folder",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await folderService.GetUserQuestFolder(userId)
            return HttpResponse(c, 200, "User Quest Folder data retrieved successfully", result)
        }
    )
    .get("/user/available",
        describeRoute({
            tags: ["Folder"],
            summary: "Get User Available Quest Folder",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await folderService.GetUserAvailableFolders(userId)
            return HttpResponse(c, 200, "User Available Quest Folder data retrieved successfully", result)
        }
    )
    .get("/:folderId",
        describeRoute({
            tags: ["Folder"],
            summary: "Get Quest Folder By ID",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const { folderId } = c.req.param()
            const userId = c.get("user").id
            const result = await folderService.GetFolderById(userId, folderId)
            return HttpResponse(c, 200, "Quest Folder data retrieved successfully", result)
        }
    )
    .post("/",
        describeRoute({
            tags: ["Folder"],
            summary: "Create Quest Folder",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        validator("json", createFolderValidation),
        async (c) => {
            const { name, description, endedAt, icon, color } = c.req.valid("json")
            const userId = c.get("user").id
            const result = await folderService.CreateQuestFolder(userId, name, endedAt, description, icon, color)
            return HttpResponse(c, 201, "Quest folder created successfully", result)
        }
    )
    .patch("/:folderId",
        describeRoute({
            tags: ["Folder"],
            summary: "Update Quest Folder",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        validator("json", updateFolderValidation),
        async (c) => {
            const { name, description } = c.req.valid("json")
            const { folderId } = c.req.param()
            const userId = c.get("user").id
            const result = await folderService.UpdateQuestFolder(folderId, userId, name, description)
            return HttpResponse(c, 200, "Quest folder updated successfully", result)
        }
    )
    .delete("/:folderId",
        describeRoute({
            tags: ["Folder"],
            summary: "Delete Quest Folder",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const { folderId } = c.req.param()
            const userId = c.get("user").id
            const result = await folderService.DeleteQuestFolderById(folderId, userId)
            return HttpResponse(c, 200, "Quest folder deleted successfully", result)
        }
    )
