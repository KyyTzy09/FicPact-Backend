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

    async CreateAIReflection(userId: string, content: string) {
        return await prisma.reflection.create({
            data: {
                userId,
                content,
            }
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
}