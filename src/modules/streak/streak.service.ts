import type { UserRepository } from "../user/user.repository.js";

export class StreakService {
    constructor(private readonly userRepository: UserRepository) { }

    async updateUserStreak(userId: string, currentStreak: number, highestStreak: number, lastStreakActive: Date) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const yesterday = new Date(startOfDay)
        yesterday.setDate(yesterday.getDate() - 1)

        const isSameDay = lastStreakActive >= startOfDay && lastStreakActive < endOfDay;
        const isYesterday = lastStreakActive >= yesterday && lastStreakActive < startOfDay

        if (isSameDay) {
            return;
        }

        let newStreak = 1;
        if (isYesterday) {
            newStreak = currentStreak + 1
        }

        const newHighestStreak = Math.max(newStreak, highestStreak);

        await this.userRepository.updateUserStreak(userId, newStreak, newHighestStreak, now);

        return newStreak;
    }
}