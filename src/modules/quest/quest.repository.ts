import { prisma } from "../../common/utils/prisma.js";

export class QuestRepository {
    public async findAll(userId: string) {
        return await prisma.quest.findMany({
            where: {
                folder: {
                    userId,
                },
            },
        });
    }

    public async findByUnique(folderId: string, questName: string) {
        return await prisma.quest.findUnique({
            where: {
                folderId_name: {
                    folderId,
                    name: questName
                }
            }
        })
    }

    public async findById(questId: string) {
        return await prisma.quest.findUnique({
            where: {
                id: questId,
            },
        });
    }

    public async findPendingQuestsBetweenDates(userIds: string[], startDate: Date, endDate: Date) {
        return await prisma.quest.findMany({
            where: {
                folder: {
                    userId: {
                        in: userIds
                    },
                },
                deadLineAt: {
                    gte: startDate,
                    lte: endDate,
                },
                isSuccess: false,
            },
            include: {
                folder: true
            }
        })
    }

    public async updateComplete(questId: string, completedDate: Date) {
        return await prisma.quest.update({
            where: {
                id: questId,
            },
            data: {
                isSuccess: true,
                completedAt: completedDate
            },
        });
    }

    public async createQuest(folderId: string, title: string, description: string, deadline: string) {
        return await prisma.quest.create({
            data: {
                folderId,
                name: title,
                description,
                deadLineAt: deadline,
            },
        });
    }

    public async deleteQuest(questId: string) {
        return await prisma.quest.delete({
            where: {
                id: questId,
            },
        });
    }

    public async updateQuest(questId: string, title: string, description: string, deadline: Date) {
        return await prisma.quest.update({
            where: {
                id: questId,
            },
            data: {
                name: title,
                description,
                deadLineAt: deadline,
            },
        });
    }
}