import type { Achievement } from "@prisma/client";
import type { AchievementCondition, AchievementCriteria, AchievementType } from "../../common/types/achievements.js";
import type { AchievementRepository } from "./achievement.repository.js";
import { HTTPException } from "hono/http-exception";

export class AchievementService {
    constructor(private readonly achievementRepository: AchievementRepository) { }

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
        const achievements = await this.achievementRepository.getAchievements()
        const userAchievements = await this.achievementRepository.getUserAchievements(userId)

        const userAchievementMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]))
        return achievements.map(achievement => {
            const userAchievement = userAchievementMap.get(achievement.id)

            return {
                ...achievement,
                isUnlocked: !!userAchievement,
                isClaimed: userAchievement ? userAchievement.isClaimed : false,
            }
        })
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
