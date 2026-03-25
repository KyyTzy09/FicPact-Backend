import type { NotificationType } from "@prisma/client";
import type { UserRepository } from "../user/user.repository.js";
import type { NotificationRepository } from "./notification.repository.js";
import { HTTPException } from "hono/http-exception";

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
  ) {}
  public async GetAllUserNotifications(userId: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new Error("User tidak ditemukan");

    const notifications =
      await this.notificationRepository.findByUserId(userId);
    return {
      all: notifications,
      readed: notifications.filter((notification) => notification.isRead),
      unread: notifications.filter((notification) => !notification.isRead),
    };
  }

  public async getReflectionTriggerNotifications(userId: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new Error("User tidak ditemukan");

    const notifications =
      await this.notificationRepository.findReflectionTriggerNotificationsByUserId(
        userId,
      );
    return notifications;
  }

  public async getLatestReflectionTriggerNotification(userId: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new Error("User tidak ditemukan");

    const notifications =
      await this.notificationRepository.findReflectionTriggerNotificationsByUserId(
        userId,
      );
    return notifications[0] || null;
  }

  public async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data: Record<string, any>,
  ) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new Error("User tidak ditemukan");

    const notification = await this.notificationRepository.createNotification(
      userId,
      title,
      message,
      type,
      data,
    );
    return notification;
  }

  public async getNotificationById(notificationId: string) {
    const existingNotification =
      await this.notificationRepository.findById(notificationId);
    if (!existingNotification) throw new Error("Notification tidak ditemukan");

    return existingNotification;
  }

  public async markNotificationAsRead(notificationId: string) {
    const existingNotification =
      await this.notificationRepository.findById(notificationId);
    if (!existingNotification) throw new Error("Notification tidak ditemukan");

    const updatedNotification =
      await this.notificationRepository.markAsRead(notificationId);
    return updatedNotification;
  }

  public async markNotificationAsDone(notificationId: string) {
    const existingNotification =
      await this.notificationRepository.findById(notificationId);
    if (!existingNotification) throw new Error("Notification tidak ditemukan");

    const updatedNotification =
      await this.notificationRepository.markAsDone(notificationId);
    if (!updatedNotification)
      throw new HTTPException(400, {
        message: "Gagal mengubah status notifikasi",
      });

    return updatedNotification;
  }
}
