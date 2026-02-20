import { Hono } from "hono";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { QuestService } from "./quest.service.js";
import { UserRepository } from "../user/user.repository.js";
import { QuestRepository } from "./quest.repository.js";
import { HttpResponse } from "../../common/utils/response.js";


const questRepository = new QuestRepository()
const userRepository = new UserRepository()
const questService = new QuestService(questRepository, userRepository)

export const questController = new Hono()
    .get(
        "/",
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await questService.findAllQuest(userId)
            return HttpResponse(c, 200, "User Quest data retrieved successfully", result)
        }
    )
    .put(
        "/:questId/complete",
        authMiddleware,
        async (c) => {
            const { questId } = c.req.param()
            const userId = c.get("user").id
            const result = await questService.updateCompleteQuest(questId, userId)
            return HttpResponse(c, 200, "Quest updated successfully", result)
        }
    )
