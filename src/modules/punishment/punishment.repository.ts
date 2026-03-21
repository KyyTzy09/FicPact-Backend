import type { QuestPunishmentStatus } from "@prisma/client";
import { prisma } from "../../common/utils/prisma.js";

export class PunishmentRepository {
    public async findQuestPunishment(questId: string) {
        return await prisma.questPunishment.findUnique({
            where: {
                questId
            }
        })
    }

    public async findPunishmentByUserId(punishmentId: string, userId: string) {
        return await prisma.questPunishment.findUnique({
            where: {
                questId: punishmentId,
                userId
            }
        })
    }

    public async createPunishment(questId: string, userId: string, name: string, deadlineAt: Date) {
        return await prisma.questPunishment.create({
            data: {
                questId,
                userId,
                name,
                deadlineAt
            }
        })
    }

    public async updatePunishmentStatus(questId: string, status: QuestPunishmentStatus) {
        return await prisma.questPunishment.update({
            where: {
                questId
            },
            data: {
                status
            }
        })
    }
}