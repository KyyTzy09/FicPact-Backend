import { Hono } from "hono";
import { FolderService } from "./folder.service.js";
import { FolderRepository } from "./folder.repository.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { sValidator } from "@hono/standard-validator";
import { createFolderValidation, updateFolderValidation } from "./folder.validation.js";

const folderRepository = new FolderRepository()
const folderService = new FolderService(folderRepository)
export const folderController = new Hono()
    .get("/",
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await folderService.GetUserQuestFolder(userId)
            return HttpResponse(c, 200, "User Quest Folder data retrieved successfully", result)
        }
    )
    .get("/:folderId",
        authMiddleware,
        async (c) => {
            const { folderId } = c.req.param()
            const userId = c.get("user").id
            const result = await folderService.GetFolderById(userId, folderId)
            return HttpResponse(c, 200, "Quest Folder data retrieved successfully", result)
        }
    )
    .post("/",
        authMiddleware,
        sValidator("json", createFolderValidation),
        async (c) => {
            const { name, description, endedAt } = c.req.valid("json")
            const userId = c.get("user").id
            const result = await folderService.CreateQuestFolder(userId, name, endedAt, description)
            return HttpResponse(c, 201, "Quest folder created successfully", result)
        }
    )
    .patch("/:folderId",
        authMiddleware,
        sValidator("json", updateFolderValidation),
        async (c) => {
            const { name, description } = c.req.valid("json")
            const { folderId } = c.req.param()
            const userId = c.get("user").id
            const result = await folderService.UpdateQuestFolder(folderId, userId, name, description)
            return HttpResponse(c, 200, "Quest folder updated successfully", result)
        }
    )
    .delete("/:folderId",
        authMiddleware,
        async (c) => {
            const { folderId } = c.req.param()
            const userId = c.get("user").id
            const result = await folderService.DeleteQuestFolderById(folderId, userId)
            return HttpResponse(c, 200, "Quest folder deleted successfully", result)
        }
    )