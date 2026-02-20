import { Hono } from "hono";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";

const userRepository = new UserRepository()
const userService = new UserService(userRepository)

export const userController = new Hono()
    .get(
        "/session",
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await userService.getSession(userId)
            return HttpResponse(c, 200, "Session Retrieved successfully", result)
        }
    )