import type { Achievement } from "@prisma/client";
import type { AchievementCriteria, AchievementType } from "../../common/types/achievements.js";
import type { AchievementRepository } from "./achievement.repository.js";
import { HTTPException } from "hono/http-exception";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { UserRepository } from "../user/user.repository.js";

export class AchievementService {
    constructor(private readonly achievementRepository: AchievementRepository, private readonly questRepository?: QuestRepository) { }

    public async getAllAchievements() {
        return await this.achievementRepository.getAchievements()
    }

    public async claimAchievement(userId: string, achievementId: string) {
        const achievement = await this.achievementRepository.findAchievementById(achievementId)
        if (!achievement) throw new HTTPException(404, { message: "Achievement tidak ditemukan" })

        const claimedAchievement = await this.achievementRepository.claimAchievement(userId, achievementId)
        if (!claimedAchievement) throw new HTTPException(500, { message: "Gagal mengklaim achievement" })

        return claimedAchievement
    }

    public async getUserAchievements(userId: string) {
        const userAchievements = await this.achievementRepository.getUserAchievements(userId)
        const achievements = await this.achievementRepository.getAchievements()
        const userAchievementMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]))
        const countReflectedQuests = await this.questRepository?.countUserReflectedQuest(userId) || 0
        const countUserCompletedQuests = await this.questRepository?.countUserCompletedQuest(userId)

        const results = achievements.map(achievement => {
            const userAchievement = userAchievementMap.get(achievement.id)
            let progress = 0
            let current = 0
            const criteria = achievement.criteria as AchievementCriteria
            const target = criteria.target

            switch (criteria.type) {
                case "folder":
                    progress = (target / userAchievement?.user.questFolders.length! || 0) * 100
                    current = userAchievement?.user.questFolders.length || 0
                    break
                case "level":
                    progress = (target / userAchievement?.user.level! || 0) * 100
                    current = userAchievement?.user.level || 0
                    break
                case "quest":
                    progress = (target / countReflectedQuests) * 100
                    current = countReflectedQuests
                    break
                case "reflection":
                    progress = (target / countReflectedQuests) * 100
                    current = countReflectedQuests
                    break
            }

            return {
                ...achievement,
                progress: progress || 0,
                current,
                isUnlocked: !!userAchievement,
                type: (achievement.criteria as AchievementCriteria).type,
                isClaimed: userAchievement ? userAchievement.isClaimed : false,
            }

        })

        return {
            total: results.length,
            achievements: results,
            unclaimed: results.filter(a => a.isUnlocked && !a.isClaimed),
            claimed: results.filter(a => a.isClaimed),
            unlocked: results.filter(a => !a.isUnlocked),
        }
    }

    public async unlockAchievements(
        userId: string,
        progressValue: number,
        type: AchievementType,
    ) {
        const achievements = await this.achievementRepository.getAchievementsByCriteria(type)
        const existing = await this.achievementRepository.getUserAchievements(userId)
        const existingIds = new Set(existing.map(a => a.achievementId))

        const unlockedAchievements: Achievement[] = []
        for (const achievement of achievements) {
            const criteria = achievement.criteria as AchievementCriteria

            if (
                progressValue >= criteria.target &&
                !existingIds.has(achievement.id)
            ) {
                unlockedAchievements.push(achievement)
            }
        }

        if (unlockedAchievements.length > 0) {
            await this.achievementRepository.unlockAchievements(
                userId,
                unlockedAchievements.map(a => a.id)
            )
        }

        return unlockedAchievements
    }
} 
