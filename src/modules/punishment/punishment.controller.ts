import { Hono } from "hono";
import { createPunishmentValidation, updatePunishmentStatusValidation } from "./punishment.validation.js";
import { describeRoute, validator } from "hono-openapi";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { PunishmentService } from "./punishment.service.js";
import { PunishmentRepository } from "./punishment.repository.js";
import { UserService } from "../user/user.service.js";
import { UserRepository } from "../user/user.repository.js";
import { QuestRepository } from "../quest/quest.repository.js";

const punishmentRepository = new PunishmentRepository()
const questRepository = new QuestRepository()
const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const punishmentService = new PunishmentService(punishmentRepository, questRepository, userService)

export const punishmentController = new Hono()
    .get("/:punishmentId/quest",
        describeRoute({
            tags: ["Punishment"],
            summary: "Get Quest Punishment",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const punishmentId = c.req.param("punishmentId")
            const result = await punishmentService.getQuestPunishment(punishmentId, userId)
            return HttpResponse(c, 200, "Punishment retrieved successfully", result)
        }
    )
    .post("/",

        describeRoute({
            tags: ["Punishment"],
            summary: "Create Punishment",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        validator("json", createPunishmentValidation),
        async (c) => {
            const userId = c.get("user").id
            const { questId, name, deadlineAt } = c.req.valid("json")
            const result = await punishmentService.createPunishment(questId, userId, name, deadlineAt)
            return HttpResponse(c, 201, "Punishment created successfully", result)
        }
    )
    .patch("/:punishmentId/status",

        describeRoute({
            tags: ["Punishment"],
            summary: "Update Punishment Status",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        validator("json", updatePunishmentStatusValidation),
        async (c) => {
            const { punishmentId } = c.req.param()
            const userId = c.get("user").id
            const { status } = c.req.valid("json")
            const result = await punishmentService.updatePunishmentStatus(userId, punishmentId, status)
            return HttpResponse(c, 200, "Punishment status updated successfully", result)
        }
    )