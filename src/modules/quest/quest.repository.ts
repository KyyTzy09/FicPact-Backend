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

    public async findById(questId: string) {
        return await prisma.quest.findUnique({
            where: {
                id: questId,
            },
        });
    }

    public async updateComplete(questId: string) {
        return await prisma.quest.update({
            where: {
                id: questId,
            },
            data: {
                isSuccess: true,
            },
        });
    }

    public async createQuest(folderId: string, title: string, description: string,  deadline: Date) {
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