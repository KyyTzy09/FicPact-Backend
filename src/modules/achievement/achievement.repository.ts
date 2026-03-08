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
}
