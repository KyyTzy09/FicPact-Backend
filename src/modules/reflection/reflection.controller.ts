import { Hono } from "hono";
import { ReflectionRepository } from "./reflection.repository.js";
import { ReflectionService } from "./reflection.service.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { UserRepository } from "../user/user.repository.js";
import { sValidator } from "@hono/standard-validator";
import { createUserFailedReflectionValidation } from "./reflection.validation.js";

const reflectionRepository = new ReflectionRepository()
const userRepository = new UserRepository()
const reflectionService = new ReflectionService(reflectionRepository, userRepository)

export const reflectionController = new Hono()
    .get("/latest",
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await reflectionService.GetLatestReflection(userId)
            return HttpResponse(c, 200, "Reflection retrieved successfully", result)
        }
    )
    .post("/create-failed",
        authMiddleware,
        sValidator("json", createUserFailedReflectionValidation),
        async (c) => {
            const { reason, addOns } = c.req.valid("json")
            const userId = c.get("user").id
            const result = await reflectionService.CreateUserFailedReflection(userId, reason, addOns)
            return HttpResponse(c, 201, "Reflection created successfully", result)
        }
    )