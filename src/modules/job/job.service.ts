import { FRONTEND_BASE_URL } from "../../common/utils/env.js";
import { generateWhatsappMessage, sendWhatsApp } from "../../common/utils/fonnte.js";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { ReflectionRepository } from "../reflection/reflection.repository.js";
import type { UserRepository } from "../user/user.repository.js";

export class JobService {
    constructor(private readonly userRepository: UserRepository, private readonly reflectionRepository: ReflectionRepository, private readonly questRepository: QuestRepository) { }

    public async createReflectionTrigger() {
        const now = new Date()
        const tenMinutesLater = new Date()
        tenMinutesLater.setMinutes(now.getMinutes() + 10)

        // Cari user yang NextReflection nya kurang 10 menit lagi
        const users = await this.userRepository.findUsersByNextReflectionDate(now, tenMinutesLater)
        const userIds = users.map(({ id }) => { return id })
        // Langsung buat reflectionTrigger
        const createdReflectionTrigger = await this.reflectionRepository.createManyReflectionTrigger(userIds)

        return { users, reflectionTrigger: createdReflectionTrigger }
    }

    public async whatshappNotification() {
        const now = new Date()
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)
        // Cari semua User dengan LTE last reflection
        const users = await this.userRepository.findUsersByLastReflectionDate(sevenDaysAgo)
        const userIds = users
            .filter((user) => user.phone)
            .map((user) => user.id)

        const twoHoursAgo = new Date(now)
        twoHoursAgo.setHours(now.getHours() - 2)

        const quests = await this.questRepository.findPendingQuestsBetweenDates(userIds, twoHoursAgo, now)
        for (const quest of quests) {
            const { id, name, deadLineAt, folder: { name: folderName, userId } } = quest
            const user = users.find((user) => user.id === userId)
            if (!user) continue

            const message = generateWhatsappMessage("reminder_quest", `${name} dari folder ${folderName}`, `${FRONTEND_BASE_URL}/quest/${id}`, deadLineAt?.toString())

            if (!user.phone) continue
            await sendWhatsApp(user?.phone || "", message)
        }

        return users.filter((user) => user.phone)
    }
}