import { Hono } from "hono";
import { FolderService } from "./folder.service.js";
import { FolderRepository } from "./folder.repository.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { sValidator } from "@hono/standard-validator";
import { createFolderValidation } from "./folder.validation.js";

const folderRepository = new FolderRepository()
const folderService = new FolderService(folderRepository)
export const FolderController = new Hono()
    .post("/",
        authMiddleware,
        sValidator("json", createFolderValidation),
        async (c) => {
            const { name, description } = c.req.valid("json")
            const userId = c.get("user").id
            const result = folderService.CreateQuestFolder(userId, name, description)
            return HttpResponse(c, 201, "Quest folder created successfully", result)
        }
    )