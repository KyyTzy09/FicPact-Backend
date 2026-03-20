import { Hono } from "hono";
import { UserRepository } from "../user/user.repository.js";
import { LeaderboardService } from "./leaderboard.service.js";
import { HttpResponse } from "../../common/utils/response.js";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const userRepository = new UserRepository()
const leaderboardService = new LeaderboardService(userRepository)

export const leaderboardController = new Hono()
    .get(
        "/weekly",
        describeRoute({
            tags: ["Leaderboard"],
            summary: "Get Weekly Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const result = await leaderboardService.getWeeklyLeaderboard();
            return HttpResponse(c, 200, "Weekly Leaderboard retrieved successfully", result)
        }
    )
    .get(
        "/monthly",
        describeRoute({
            tags: ["Leaderboard"],
            summary: "Get Monthly Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const result = await leaderboardService.getMonthlyLeaderboard();
            return HttpResponse(c, 200, "Monthly Leaderboard retrieved successfully", result)
        }
    )
    .get("/all-time",
        describeRoute({
            tags: ["Leaderboard"],
            summary: "Get All Time Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const result = await leaderboardService.getAllTimeLeaderboard();
            return HttpResponse(c, 200, "All Time Leaderboard retrieved successfully", result)
        }
    )
    .post("/update-weekly",
        describeRoute({
            tags: ["Leaderboard"],
            summary: "Update Weekly Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const result = await leaderboardService.createWeeklyLeaderboard();
            return HttpResponse(c, 200, "Leaderboard updated successfully", result)
        }
    )
    .post("/update-monthly",
        describeRoute({
            tags: ["Leaderboard"],
            summary: "Update Monthly Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const result = await leaderboardService.createMonthlyLeaderboard();
            return HttpResponse(c, 200, "Leaderboard updated successfully", result)
        }
    )