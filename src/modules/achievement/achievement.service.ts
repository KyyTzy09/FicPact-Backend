import type { AchievementRepository } from "./achievement.repository.js";

export class AchievementService {
    constructor(private achievementRepository: AchievementRepository) { }

    public async getAllAchievements() {
        return await this.achievementRepository.getAchievements()
    }

    public async checkAchievement(userId: string) {

    }
}