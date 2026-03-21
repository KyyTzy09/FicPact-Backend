import { Hono } from "hono";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { describeRoute, validator } from "hono-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { updateUserReflectionTimeValidation } from "./user.validation.js";
import { QuestRepository } from "../quest/quest.repository.js";

const userRepository = new UserRepository()
const questRepository = new QuestRepository()
const userService = new UserService(userRepository, questRepository)

export const userController = new Hono()
    .get(
        "/session",
        describeRoute({
            tags: ["User"],
            summary: "Get User Session",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await userService.getSession(userId)
            if (!result) return HttpResponse(c, 404, "Session not found", null)
            return HttpResponse(c, 200, "Session Retrieved successfully", result)
        }
    )
    .get(
        "/profile",
        describeRoute({
            tags: ["User"],
            summary: "Get User Profile",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await userService.getProfile(userId)
            return HttpResponse(c, 200, "Profile Retrieved successfully", result)
        }
    )
    .patch("/reflection-time",
        describeRoute({
            tags: ["User"],
            summary: "Update User Reflection Time",
            security: [{ bearerAuth: [] }]
        }),
        authMiddleware,
        validator("json", updateUserReflectionTimeValidation),
        async (c) => {
            const userId = c.get("user").id
            const { days, hours } = c.req.valid("json")
            const result = await userService.updateReflectionTime(userId, days, hours)
            return HttpResponse(c, 200, "Reflection time updated successfully", result)
        }
    )
