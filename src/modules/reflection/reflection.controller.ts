import { Hono } from "hono";
import { ReflectionRepository } from "./reflection.repository.js";
import { ReflectionService } from "./reflection.service.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { UserRepository } from "../user/user.repository.js";
import { createQuestReflectionValidation } from "./reflection.validation.js";
import { describeRoute, validator } from "hono-openapi";
import { QuestRepository } from "../quest/quest.repository.js";
import { FolderRepository } from "../folder/folder.repository.js";
import { AIService } from "../ai/ai.service.js";
import { AchievementRepository } from "../achievement/achievement.repository.js";
import { AchievementService } from "../achievement/achievement.service.js";
import { NotificationService } from "../notification/notification.service.js";
import { NotificationRepository } from "../notification/notification.repository.js";
import { UserService } from "../user/user.service.js";

const reflectionRepository = new ReflectionRepository()
const userRepository = new UserRepository()
const folderRepository = new FolderRepository()
const notificationRepository = new NotificationRepository()
const questRepository = new QuestRepository()
const userService = new UserService(userRepository, questRepository)
const aiService = new AIService()
const achievementRepository = new AchievementRepository()
const achievementService = new AchievementService(achievementRepository)
const notificationService = new NotificationService(notificationRepository, userRepository)
const reflectionService = new ReflectionService(folderRepository, questRepository, reflectionRepository, userRepository, userService, achievementService, aiService, notificationService)

export const reflectionController = new Hono()
    .get("/latest",
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await reflectionService.GetLatestReflection(userId)
            return HttpResponse(c, 200, "Reflection retrieved successfully", result)
        }
    )
    .post("/quest",
        authMiddleware,
        describeRoute({
            tags: ["Reflection"],
            summary: "Create Quest reflection (memiliki 2 type, type quest gagal dan sukses)",
            security: [{ bearerAuth: [] }]
        }),
        validator("json", createQuestReflectionValidation),
        async (c) => {
            const userId = c.get("user").id
            const { questId, reasons, questStatus, questLevel } = c.req.valid("json")
            const result = await reflectionService.CreateQuestReflection(userId, questId, reasons, questStatus, questLevel)

            return HttpResponse(c, 201, "Quest reflection created successfully", result)
        }
    )
    // .post("/create-failed",
    //     authMiddleware,
    //     describeRoute({
    //         tags: ["Reflection"],
    //         summary: "Create User Failed Reflection",
    //         security: [{ bearerAuth: [] }],
    //     }),
    //     validator("json", createUserFailedReflectionValidation),
    //     async (c) => {
    //         const { reason, addOns } = c.req.valid("json")
    //         const userId = c.get("user").id
    //         const result = await reflectionService.CreateUserFailedReflection(userId, reason, addOns)
    //         return HttpResponse(c, 201, "Reflection created successfully", result)
    //     }
    // )
    // .patch("/trigger-reflection",
    //     describeRoute({
    //         tags: ["Reflection"],
    //         summary: "Update Reflection trigger",
    //         security: [{ bearerAuth: [] }]
    //     }),
    //     authMiddleware,
    //     validator("json", updateReflectionTriggerValidation),
    //     async (c) => {
    //         const userId = c.get("user").id
    //         const { reflectionTriggerId, isReflection } = c.req.valid("json")
    //         const result = await reflectionService.updateReflectionTrigger(userId, reflectionTriggerId, isReflection)
    //         return HttpResponse(c, 200, "Reflection trigger updated successfully", result)
    //     }
    // )
    .post("/create-reflection",
        authMiddleware,
        describeRoute({
            tags: ["Reflection"],
            summary: "Create User Reflection",
            security: [{ bearerAuth: [] }]
        }),
        async (c) => {
            const userId = c.get("user").id
            const result = await reflectionService.CreateUserReflection(userId)
            return HttpResponse(c, 200, "Reflection retrieved successfully", result)
        }
    )