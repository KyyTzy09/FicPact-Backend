import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { AchievementRepository } from "./achievement.repository.js";
import { AchievementService } from "./achievement.service.js";
import { HttpResponse } from "../../common/utils/response.js";
import { UserRepository } from "../user/user.repository.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const achievementRepository = new AchievementRepository()
const userRepository = new UserRepository()
const achievementService = new AchievementService(achievementRepository, userRepository)

export const achievementController = new Hono()
    .get("/all",
        describeRoute({
            tags: ["Achievements"],
            summary: "Get All Achievements",
            description: "Get All Achievements data",
        }),
        async (c) => {
            const result = await achievementService.getAllAchievements()
            return HttpResponse(c, 200, "Achievements retrieved successfully", result)
        }
    )
    .get("/user",
        describeRoute({
            tags: ["Achievements"],
            summary: "Get User Achievements",
            description: "Get User Achievements data",
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id as string
            const result = await achievementService.getUserAchievements(userId)

            return HttpResponse(c, 200, "User Achievements retrieved successfully", result)
        }
    )