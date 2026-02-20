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
}