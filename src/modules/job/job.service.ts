import { HTTPException } from "hono/http-exception";
import { FRONTEND_BASE_URL } from "../../common/utils/env.js";
import { generateWhatsappMessage, sendWhatsApp } from "../../common/utils/fonnte.js";
import type { NotificationRepository } from "../notification/notification.repository.js";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { ReflectionRepository } from "../reflection/reflection.repository.js";
import type { UserRepository } from "../user/user.repository.js";
import { getMonthRange, getWeekRange, isLastDayOfMonth, isSunday } from "../../common/utils/date.js";
import type { LeaderboardService } from "../leaderboards/leaderboard.service.js";
import { LeaderboardType } from "@prisma/client";

export class JobService {
    constructor(private readonly userRepository: UserRepository, private readonly notificationRepository: NotificationRepository, private readonly questRepository: QuestRepository, private readonly leaderBoardService: LeaderboardService) { }

    public async createReflectionTrigger() {
        const now = new Date()
        const tenMinutesLater = new Date()
        tenMinutesLater.setMinutes(now.getMinutes() + 10)

        // Cari user yang NextReflection nya kurang 10 menit lagi
        const users = await this.userRepository.findUsersByNextReflectionDate(now, tenMinutesLater)
        let userIds = users.map(({ id }) => { return id })
        const existingNotifications = await this.notificationRepository.findPendingUsersNotification(userIds, "REFLECTION_TRIGGER")

        const mappedExistingNotificationUserIds = new Map(existingNotifications.map((notification) => [notification.userId, true]))

        // Cari user yang belum memiliki notification REFLECTION_TRIGGER
        const newUserIds = users
            .filter(user => !mappedExistingNotificationUserIds.has(user.id))
            .map(user => user.id)

        // Langsung buat reflectionTrigger
        const createdReflectionTrigger = await this.notificationRepository.createManyNotification(newUserIds.map((userId) => ({
            userId,
            title: "🧠 Waktunya refleksi",
            message: "Yuk luangkan sebentar buat lihat progresmu hari ini. AI bakal bantu kasih insight dari aktivitasmu.",
            type: "REFLECTION_TRIGGER",
            data: {}
        })))

        return { users, reflectionTrigger: createdReflectionTrigger }
    }

    public async whatshappNotification() {
        const now = new Date()

        const users = await this.userRepository.findAllUsers()
        const userMap = new Map(users.map((user) => [user.id, user]))
        const userIds = users
            .filter((user) => user.phone)
            .map((user) => user.id)

        const twoHoursAgo = new Date(now)
        twoHoursAgo.setHours(now.getHours() - 2)

        const quests = await this.questRepository.findPendingQuestsBetweenDates(userIds, twoHoursAgo, now)
        for (const quest of quests) {
            const { id, name, deadLineAt, folder: { name: folderName, userId } } = quest
            const user = userMap.get(userId)
            if (!user) continue

            const message = generateWhatsappMessage("reminder_quest", `${name} dari folder ${folderName}`, `${FRONTEND_BASE_URL}/quest/${id}`, deadLineAt?.toString())

            if (!user.phone) continue
            await sendWhatsApp(user?.phone || "", message)
        }

        return users.filter((user) => user.phone)
    }

    public async createFailedQuestNotification() {
        const now = new Date()
        const twoHoursAgo = new Date(now)
        twoHoursAgo.setHours(now.getHours() - 2)

        const quests = await this.questRepository.findFailedQuestsBeforeDate(now, twoHoursAgo)
        const userIds = quests.map((quest) => quest.folder.userId)

        // Masukan ke map untuk cari tau user mana yang udah punya notification QUEST_FAILED
        const users = await this.userRepository.findUserByIds(userIds)
        const userMap = new Map(users.map((user) => [user.id, user]))

        // Cari notification QUEST_FAILED yang belum dibaca untuk user-user tersebut
        const existingNotifications = await this.notificationRepository.findLatestUsersNotification(userIds, "QUEST_FAILED")
        const mappedExistingNotificationUserIds = new Map(existingNotifications.map((notification) => [`${notification.userId}-${(notification.data as { questId: string })?.questId}`, true]))

        const notificationsToCreate = quests
            .filter(q => !mappedExistingNotificationUserIds.has(`${q.folder.userId}-${q.id}`))
            .map(q => {
                const user = userMap.get(q.folder.userId)
                if (!user) return null

                return {
                    userId: user.id,
                    title: "⏰ Quest gagal diselesaikan",
                    message: `Yah, quest ${q.name} dari folder ${q.folder.name} gagal diselesaikan tepat waktu.`,
                    type: "QUEST_FAILED",
                    data: {
                        questId: q.id,
                        questName: q.name,
                        folderName: q.folder.name
                    }
                }
            })
            .filter(Boolean) as Parameters<NotificationRepository["createManyNotification"]>[0]
        if (!notificationsToCreate.length) return []
        await this.notificationRepository.createManyNotification(notificationsToCreate)

        return users.filter((user) => user.phone).map((user) => {
            return {
                id: user.id,
                name: user.profile?.name,
                phone: user.phone
            }
        })
    }

    public async createWeeklyLeaderboard() {
        const now = new Date()

        if (!isSunday(now)) {
            throw new HTTPException(400, {
                message: "Leaderboard mingguan hanya dibuat hari Minggu"
            })
        }

        const { start, end } = getWeekRange(now)
        return await this.leaderBoardService.createLeaderboard(start, end, LeaderboardType.WEEKLY)
    }

    public async createMonthlyLeaderboard() {
        const now = new Date()

        if (!isLastDayOfMonth(now)) {
            throw new HTTPException(400, {
                message: "Leaderboard bulanan hanya dibuat di akhir bulan"
            })
        }

        const { start, end } = getMonthRange(now)
        return await this.leaderBoardService.createLeaderboard(start, end, LeaderboardType.MONTHLY)
    }
}