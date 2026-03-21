import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "./user.repository.js";
import { getNextReflectionDate, updateReflectionTime } from "../../common/utils/date.js";
import { processExpGain } from "../../common/utils/leveling.js";
import type { Quest, User } from "@prisma/client";
import type { ExpLogSourceType } from "../../common/types/explog.js";
import type { QuestRepository } from "../quest/quest.repository.js";

export class UserService {
    constructor(private readonly userRepository: UserRepository, private readonly questRepository: QuestRepository) { }

    public async getUserById(userId: string) {
        const existingUser = this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        return existingUser
    }

    public async getSession(userId: string) {
        const existingUser = this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        return existingUser
    }

    public async getProfile(userId: string) {
        const existingUser = await this.userRepository.findUserByIdWithProfile(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })
        const totalQuestCompleted = await this.questRepository.countCompletedQuest(userId)
        console.log("Total quests completed:", totalQuestCompleted);
        //const expToLevel
        const questFolderProgress = existingUser.questFolders.map(folder => {
            const totalQuests = folder.quests.length;
            const completedQuests = folder.quests.filter(quest => quest.isSuccess).length;
            const progress = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;
            return {
                ...folder,
                progress: Math.round(progress)

            }
        })

        return {
            ...existingUser,
            questFolders: questFolderProgress,
            totalQuestCompleted
        }
    }

    public async updateReflectionTime(userId: string, days: number, hours: number) {
        const existingUser = await this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        const nextReflectionDate =
            existingUser.reflectionDays === days ?
                updateReflectionTime(existingUser.nextReflection!, existingUser.reflectionDays, hours) :
                getNextReflectionDate(days, hours)

        const updatedUser = await this.userRepository.updateUserReflectionTime(userId, nextReflectionDate, days)
        if (!updatedUser) throw new HTTPException(500, { message: "Gagal mengubah waktu refleksi" })

        return updatedUser
    }

    public async updateUserLevel(user: User, userId: string, expGained: number, source: ExpLogSourceType) {
        const levelUpUser = processExpGain({ ...user }, expGained);
        if (!levelUpUser) throw new HTTPException(400, { message: "Gagal memperbarui level" });

        const updatedUser = await this.userRepository.updateLevelAndLog(userId, {
            newLevel: levelUpUser.newLevel,
            remainingExp: levelUpUser.remainingExp,
            totalExp: levelUpUser.totalExp,
            newExpToNextLevel: levelUpUser.expToNextLevel
        }, expGained, source);

        return updatedUser
    }

    public async updateLevelAfterQuest(user: User, userId: string, quest: Quest) {
        const levelUpUser = processExpGain({ ...user }, quest.expReward);
        if (!levelUpUser) throw new HTTPException(400, { message: "Gagal memperbarui level" });
        const updatedUser = await this.userRepository.updateLevelAndLog(userId, {
            newLevel: levelUpUser.newLevel,
            remainingExp: levelUpUser.remainingExp,
            totalExp: levelUpUser.totalExp,
            newExpToNextLevel: levelUpUser.expToNextLevel
        }, quest.expReward, "quest");

        return updatedUser
    }
}
