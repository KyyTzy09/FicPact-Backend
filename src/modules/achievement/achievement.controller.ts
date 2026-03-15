import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { AchievementRepository } from "./achievement.repository.js";
import { AchievementService } from "./achievement.service.js";
import { HttpResponse } from "../../common/utils/response.js";

const achievementRepository = new AchievementRepository()
const achievementService = new AchievementService(achievementRepository)

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