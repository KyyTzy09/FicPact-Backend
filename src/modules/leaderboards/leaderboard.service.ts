import { LeaderboardType } from "@prisma/client";
import { getMonthPeriodDate, getMonthRange, getWeekPeriodDate, getWeekRange, isLastDayOfMonth, isSunday } from "../../common/utils/date.js";
import type { UserRepository } from "../user/user.repository.js";
import { HTTPException } from "hono/http-exception";

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

    public async createWeeklyLeaderboard() {
        const now = new Date()

        if (!isSunday(now)) {
            throw new HTTPException(400, {
                message: "Leaderboard mingguan hanya dibuat hari Minggu"
            })
        }

        const { start, end } = getWeekRange(now)
        return await this.createLeaderboard(start, end, LeaderboardType.WEEKLY)
    }

    public async createMonthlyLeaderboard() {
        const now = new Date()

        if (!isLastDayOfMonth(now)) {
            throw new HTTPException(400, {
                message: "Leaderboard bulanan hanya dibuat di akhir bulan"
            })
        }

        const { start, end } = getMonthRange(now)
        return await this.createLeaderboard(start, end, LeaderboardType.MONTHLY)
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

    public async createLeaderboard(
        startDate: Date,
        endDate: Date,
        type: LeaderboardType
    ) {
        // ambil exp logs
        const logs = await this.userRepository.getAllExpLogsBetweenDates(startDate, endDate)
        const expMap = new Map<string, number>()

        for (const log of logs) {
            const prev = expMap.get(log.userId) || 0
            expMap.set(log.userId, prev + log.amount)
        }

        // ambil semua user
        const users = await this.userRepository.findAllUsers()
        const result = users.map((user) => ({
            userId: user.id,
            exp: expMap.get(user.id) || 0
        }))

        // sort
        const sorted = result.sort((a, b) => b.exp - a.exp)

        // ambil top 3
        const top3 = sorted.slice(0, 3)

        // insert ke DB (transaction biar aman)
        return await this.userRepository.refreshLeaderboard(startDate, endDate, type, top3)
    }
}