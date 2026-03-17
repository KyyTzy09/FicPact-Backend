import type { AchievementCondition, AchievementType } from "../../common/types/achievements.js";
import { prisma } from "../../common/utils/prisma.js";

export class AchievementRepository {
    public async getAchievements() {
        return await prisma.achievement.findMany()
    }

    public async unlockAchievement(userId: string, achievementId: string) {
        return await prisma.userAchievement.upsert({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId,
                }
            },
            update: {},
            create: {
                userId,
                achievementId,
            }
        })
    }

    public async unlockAchievements(userId: string, achievementIds: string[]) {
        return await prisma.userAchievement.createMany({
            data: achievementIds.map(achievementId => ({
                userId,
                achievementId,
            })),
            skipDuplicates: true,
        })
    }

    public async getUserAchievements(userId: string) {
        return await prisma.userAchievement.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                achievementId: true,
                isClaimed: true
            }
        })
    }

    public async getAchievementsByCriteria(type: AchievementType, condition: AchievementCondition) {
        return await prisma.achievement.findMany({
            where: {
                AND: [
                    {
                        criteria: {
                            path: ["type"],
                            equals: type
                        }
                    },
                    {
                        criteria: {
                            path: ["condition"],
                            equals: condition
                        }
                    }
                ]
            }
        })
    }

    public async claimAchievement(userId: string, achievementId: string) {
        return await prisma.userAchievement.update({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId,
                }
            },
            data: {
                isClaimed: true,
            }
        })
    }
}