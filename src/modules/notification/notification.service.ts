import type { UserRepository } from "../user/user.repository.js";
import type { NotificationRepository } from "./notification.repository.js";

export class NotificationService {
    constructor(private readonly notificationRepository: NotificationRepository, private readonly userRepository: UserRepository) { }
    public async GetAllUserNotifications(userId: string) {
        const existingUser = await this.userRepository.findUserById(userId)
        if (!existingUser) throw new Error("User tidak ditemukan")

        const notifications = await this.notificationRepository.findByUserId(userId)
        return {
            all: notifications,
            readed: notifications.filter((notification) => notification.isRead),
            unread: notifications.filter((notification) => !notification.isRead)
        }
    }

    public async getNotificationById(notificationId: string) {
        const existingNotification = await this.notificationRepository.findById(notificationId)
        if (!existingNotification) throw new Error("Notification tidak ditemukan")

        return existingNotification
    }

    public async markNotificationAsRead(notificationId: string) {
        const existingNotification = await this.notificationRepository.findById(notificationId)
        if (!existingNotification) throw new Error("Notification tidak ditemukan")

        const updatedNotification = await this.notificationRepository.markAsRead(notificationId)
        return updatedNotification
    }
}