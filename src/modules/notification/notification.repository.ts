import type { NotificationType } from "@prisma/client";
import { prisma } from "../../common/utils/prisma.js";
export class NotificationRepository {
    public async createNotfication(userId: string, title: string, message: string, type: NotificationType, data: Record<string, any>) {
        return await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                data
            }
        })
    }

    public async createManyNotification(notifications: { userId: string, title: string, message: string, type: NotificationType, data: Record<string, any> }[]) {
        return await prisma.notification.createMany({
            data: notifications
        })
    }

    public async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                isRead: true
            }
        })
    }
    
    public async findPendingUsersNotification(userIds: string[], type: NotificationType) {
        return await prisma.notification.findMany({
            where: {
                userId: {
                    in: userIds
                },
                isRead: false,
                type,
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    public async findLatestUsersNotification(userIds: string[], type: NotificationType) {
        return await prisma.notification.findMany({
            where: {
                userId: {
                    in: userIds
                },
                type,
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    public async findLatestNotification(userId: string, type: NotificationType) {
        return await prisma.notification.findFirst({
            where: {
                userId,
                type,
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    public async findPendingNotificationWithData(userId: string, type: NotificationType, field: "questId" | "punishmentId", value: string) {
        return await prisma.notification.findFirst({
            where: {
                userId,
                isRead: false,
                type,
                data: {
                    path: [field],
                    equals: value
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    public async findByUserId(userId: string) {
        return await prisma.notification.findMany({
            where: {
                userId
            }
        })
    }
}