import type { Achievement } from "@prisma/client";
import type { AchievementCondition, AchievementCriteria, AchievementType } from "../../common/types/achievements.js";
import type { AchievementRepository } from "./achievement.repository.js";

export class AchievementService {
    constructor(private readonly achievementRepository: AchievementRepository) { }

    public async getAllAchievements() {
        return await this.achievementRepository.getAchievements()
    }

    public async checkAchievement(userId: string) {

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
        condition: AchievementCondition
    ) {
        const achievements = await this.achievementRepository.getAchievementsByCriteria(type, condition)
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
