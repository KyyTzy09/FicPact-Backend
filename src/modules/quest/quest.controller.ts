import { Hono } from "hono";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { QuestService } from "./quest.service.js";
import { UserRepository } from "../user/user.repository.js";
import { QuestRepository } from "./quest.repository.js";
import { FolderRepository } from "../folder/folder.repository.js";
import { AchievementRepository } from "../achievement/achievement.repository.js";
import { HttpResponse } from "../../common/utils/response.js";
import { CreateQuestValidation, CreateQuestWithVoiceValidation } from "./quest.validation.js";
import { describeRoute, validator } from "hono-openapi";
import { AIService } from "../ai/ai.service.js";
import { AchievementService } from "../achievement/achievement.service.js";


const questRepository = new QuestRepository()
const userRepository = new UserRepository()
const folderRepository = new FolderRepository()
const achievementRepository = new AchievementRepository()
const achievementService = new AchievementService(achievementRepository)
const aiService = new AIService()

const questService = new QuestService(questRepository, userRepository, folderRepository, achievementService, aiService)
export const questController = new Hono()
  .get(
    "/",
    describeRoute({
      tags: ["Quest"],
      summary: "Get User Quest",
      security: [{ bearerAuth: [] }],
    }),
    authMiddleware,
    async (c) => {
      const userId = c.get("user").id
      const result = await questService.findAllQuest(userId)
      return HttpResponse(c, 200, "User Quest data retrieved successfully", result)
    }
  )
  .put(
    "/:questId/complete",
    describeRoute({
      tags: ["Quest"],
      summary: "Update Quest Complete",
      security: [{ bearerAuth: [] }],
    }),
    authMiddleware,
    async (c) => {
      const { questId } = c.req.param()
      const userId = c.get("user").id
      const result = await questService.updateCompleteQuest(questId, userId)
      return HttpResponse(c, 200, "Quest updated successfully", result)
    }
  )
  .post(
    "/",
    authMiddleware,
    describeRoute({
      tags: ["Quest"],
      summary: "Create Quest",
      security: [{ bearerAuth: [] }],
    }),
    validator("json", CreateQuestValidation),
    async (c) => {
      const userId = c.get("user").id
      const { deadline, description, folderId, title } = c.req.valid("json")
      const result = await questService.createQuest(userId, folderId, title, description, deadline)
      return HttpResponse(c, 201, "Quest created successfully", result)
    }
  )
  .post("/create-with-voice",
    describeRoute({
      tags: ["Quest"],
      summary: "Create Quest with Voice",
      security: [{ bearerAuth: [] }],
    }),
    authMiddleware,
    validator("json", CreateQuestWithVoiceValidation),
    async (c) => {
      const userId = c.get("user").id
      const { text, mode } = c.req.valid("json")
      const result = await questService.createQuestWithVoice(userId, text, mode)
      return HttpResponse(c, 201, "Quest created successfully", result)
    }
  )
  .delete(
    "/:questId",
    describeRoute({
      tags: ["Quest"],
      summary: "Delete Quest",
      security: [{ bearerAuth: [] }],
    }),
    authMiddleware,
    async (c) => {
      const { questId } = c.req.param()
      const result = await questService.deleteQuest(questId)
      return HttpResponse(c, 200, "Quest deleted successfully", result)
    }
  )
