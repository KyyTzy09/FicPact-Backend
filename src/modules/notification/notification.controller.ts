import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { HttpResponse } from "../../common/utils/response.js";
import { NotificationRepository } from "./notification.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { NotificationService } from "./notification.service.js";

const notificationRepository = new NotificationRepository()
const userRepository = new UserRepository()
const notificationService = new NotificationService(notificationRepository, userRepository)

export const notificationController = new Hono()
    .get("/",
        describeRoute({
            tags: ["Notification"],
            summary: "Get all user notifications",
            description: "Get all user notifications",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await notificationService.GetAllUserNotifications(userId)
            return HttpResponse(c, 200, "Success get all user notifications", result)
        }
    )
    .get("/reflection-trigger",
        describeRoute({
            tags: ["Notification"],
            summary: "Get reflection trigger notifications",
            description: "Get reflection trigger notifications",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await notificationService.getReflectionTriggerNotifications(userId)
            return HttpResponse(c, 200, "Success get reflection trigger notifications", result)
        }
    )
    .get("/reflection-trigger/latest",
        describeRoute({
            tags: ["Notification"],
            summary: "Get latest reflection trigger notification",
            description: "Get latest reflection trigger notification",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await notificationService.getLatestReflectionTriggerNotification(userId)
            return HttpResponse(c, 200, "Success get latest reflection trigger notification", result)
        }
    )
    .get("/:id/detail",
        describeRoute({
            tags: ["Notification"],
            summary: "Get notification by id",
            description: "Get notification by id",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const notificationId = c.req.param("id")
            const result = await notificationService.getNotificationById(notificationId)
            return HttpResponse(c, 200, "Success get notification by id", result)
        }
    )
    .patch("/:id/mark-as-read",
        describeRoute({
            tags: ["Notification"],
            summary: "Mark notification as read",
            description: "Mark notification as read",
            security: [{ bearerAuth: [] }],
        }),
        authMiddleware,
        async (c) => {
            const notificationId = c.req.param("id")
            const result = await notificationService.markNotificationAsRead(notificationId)
            return HttpResponse(c, 200, "Success mark notification as read", result)
        }
    )