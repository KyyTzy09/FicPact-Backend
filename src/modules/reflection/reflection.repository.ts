import type { QuestLevel, QuestReflection, QuestReflectionType, User } from "@prisma/client";
import { prisma } from "../../common/utils/prisma.js";

export class ReflectionRepository {
    async findLatestReflection(userId: string, take: number) {
        return await prisma.reflection.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            },
            take
        })
    }

    async CretesAIReflection(userId: string, content: string) {
        return await prisma.reflection.create({
            data: {
                userId,
                content,
            }
        })
    }

    async createManyReflectionTrigger(userIds: string[]) {
        return await prisma.reflectionTrigger.createManyAndReturn({
            data: userIds.map((userId) => ({
                userId
            })),
        })
    }

    async createManyQuestReflection(questId: string, reasons: string[], questLevel: QuestLevel, type: QuestReflectionType,) {
        return await prisma.questReflection.createManyAndReturn({
            data: reasons.map((reason) => ({
                questId,
                questLevel,
                reason,
                type
            }) as QuestReflection),
            skipDuplicates: true
        })
    }

    async createReflection(userId: string, content: string, startPeriod: Date, endPeriod: Date) {
        return await prisma.reflection.create({
            data: {
                userId,
                content,
            }
        })
    }

    async findReflectionTriggerById(userId: string, id: string) {
        return await prisma.reflectionTrigger.findUnique({
            where: {
                id,
                userId
            }
        })
    }

    async updateReflectionTrigger(userId: string, id: string, isReflection: boolean) {
        return await prisma.reflectionTrigger.update({
            where: {
                id,
                userId
            },
            data: {
                isReflection
            }
        })
    }
}