import type { Achievement } from "@prisma/client";
import type { AchievementCondition, AchievementCriteria, AchievementType } from "../../common/types/achievements.js";
import type { UserRepository } from "../user/user.repository.js";
import type { AchievementRepository } from "./achievement.repository.js";

export class AchievementService {
    constructor(private readonly achievementRepository: AchievementRepository, private readonly userRepository: UserRepository) { }

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

    public async unlockAchievements(userId: string, progressCount: number, type: AchievementType, condition: AchievementCondition) {
        const achievements = await this.achievementRepository.getAchievementsByCriteria(type, condition)
        let unlockedAchievements: Achievement[] = []

        for (const achievement of achievements) {
            const criteria = achievement.criteria as AchievementCriteria
            if (progressCount >= criteria.target) {
                unlockedAchievements.push(achievement)
            }
        }
        const unlockedAchievementIds = unlockedAchievements.map(a => a.id)
        await this.achievementRepository.unlockAchievements(userId, unlockedAchievementIds)

        return unlockedAchievements
    }
} 
