import type { AchievementRepository } from "./achievement.repository.js";

class AchievementService {
    constructor(private achievementRepository: AchievementRepository) {}
    
    
    public async checkAchievement(userId: string) {
        
    }
}