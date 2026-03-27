import type { NotificationType } from "@prisma/client";
import { prisma } from "../../common/utils/prisma.js";
export class NotificationRepository {
  public async findById(notificationId: string) {
    return await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });
  }

  public async findByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: {
        userId,
      },
    });
  }

  public async findReflectionTriggerNotificationsByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: {
        userId,
        type: "REFLECTION_TRIGGER",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data: Record<string, any>,
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data,
      },
    });
  }

  public async createManyNotification(
    notifications: {
      userId: string;
      title: string;
      message: string;
      type: NotificationType;
      data: Record<string, any>;
    }[],
  ) {
    return await prisma.notification.createMany({
      data: notifications,
    });
  }

  public async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  public async markAsDone(notificationId: string) {
    return await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "DONE",
      },
    });
  }

  public async findPendingUsersNotification(
    userIds: string[],
    type: NotificationType,
    startDate: Date,
    endDate: Date,
  ) {
    return await prisma.notification.findMany({
      where: {
        userId: {
          in: userIds,
        },
        type,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async findLatestUsersNotification(
    userIds: string[],
    type: NotificationType,
  ) {
    return await prisma.notification.findMany({
      where: {
        userId: {
          in: userIds,
        },
        type,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async findLatestFailedQuestNotification(
    data: {
      userId: string;
      questIds: string[];
    }[],
  ) {
    return await prisma.notification.findMany({
      where: {
        userId: {
          in: data.map((item) => item.userId),
        },
        type: "QUEST_FAILED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async findLatestNotification(userId: string, type: NotificationType) {
    return await prisma.notification.findFirst({
      where: {
        userId,
        type,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async findPendingNotificationWithData(
    userId: string,
    type: NotificationType,
    field: "questId" | "punishmentId",
    value: string,
  ) {
    return await prisma.notification.findFirst({
      where: {
        userId,
        isRead: false,
        type,
        data: {
          path: [field],
          equals: value,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
