import type { AchievementCondition, AchievementType } from "../../common/types/achievements.js";
import { prisma } from "../../common/utils/prisma.js";

export class AchievementRepository {
    public async getAchievements() {
        return await prisma.achievement.findMany()
    }

    public async findAchievementById(achievementId: string) {
        return await prisma.achievement.findUnique({
            where: {
                id: achievementId
            }
        })
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

    public async claimUserAchievement(userId: string, achievementId: string) {
        return await prisma.userAchievement.update({
            where: {
                userId_achievementId: {
                    achievementId,
                    userId
                }
            },
            data: {
                isClaimed: true
            }
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
                isClaimed: true,
                user: {
                    select: {
                        id: true,
                        level: true,
                        totalExp: true,
                        questFolders: true,
                    }
                },
            }
        })
    }

    public async getAchievementsByCriteria(type: AchievementType) {
        return await prisma.achievement.findMany({
            where: {
                criteria: {
                    path: ["type"],
                    equals: type
                }
            },
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