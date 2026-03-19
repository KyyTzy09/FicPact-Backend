import { getMonthPeriodDate, getWeekPeriodDate } from "../../common/utils/date.js";
import type { UserRepository } from "../user/user.repository.js";

export class LeaderboardService {
    constructor(private readonly userRepository: UserRepository) { }

    public async getWeeklyLeaderboard() {
        const { startOfWeek, endOfWeek } = getWeekPeriodDate()
        return this.getLeaderboard(startOfWeek, endOfWeek)
    }

    public async getMonthlyLeaderboard() {
        const { startOfMonth, endOfMonth } = getMonthPeriodDate()
        return this.getLeaderboard(startOfMonth, endOfMonth)
    }

    public async getAllTimeLeaderboard() {
        const allUsers = await this.userRepository.findAllUsers()
        const allExpLogs = await this.userRepository.getAllExpLogs()

        const mapExpLogs = new Map<string, number>()

        for (const log of allExpLogs) {
            const prev = mapExpLogs.get(log.userId) || 0
            mapExpLogs.set(log.userId, prev + log.amount)
        }

        const result = allUsers.map((user) => {
            const exp = mapExpLogs.get(user.id) || 0

            return {
                id: user.id,
                profile: {
                    email: user.email,
                    name: user.profile?.name,
                    avatar: user.profile?.avatar
                },
                level: user.level,
                exp
            }
        })

        const sorted = result.sort((a, b) => b.exp - a.exp)
        return sorted.map((user, index) => ({
            ...user,
            rank: index + 1
        }))
    }

    private async getLeaderboard(start: Date, end: Date) {
        const allUsers = await this.userRepository.findAllUsers()
        const allExpLogs = await this.userRepository.getAllExpLogsBetweenDates(start, end)

        const mapExpLogs = new Map<string, number>()

        for (const log of allExpLogs) {
            const prev = mapExpLogs.get(log.userId) || 0
            mapExpLogs.set(log.userId, prev + log.amount)
        }

        const result = allUsers.map((user) => {
            const exp = mapExpLogs.get(user.id) || 0

            return {
                id: user.id,
                profile: {
                    email: user.email,
                    name: user.profile?.name,
                    avatar: user.profile?.avatar
                },
                level: user.level,
                exp
            }
        })

        const sorted = result.sort((a, b) => b.exp - a.exp)

        return sorted.map((user, index) => ({
            ...user,
            rank: index + 1
        }))
    }
}