import { prisma } from "../../common/utils/prisma.js";

export class FolderRepository {
    public async findFolderByName(userId: string, name: string) {
        return await prisma.questFolder.findUnique({
            where: {
                userId_name: {
                    userId,
                    name
                }
            }
        })
    }

    public async findFolderByUserIdAndId(userId: string, folderId: string) {
        return await prisma.questFolder.findUnique({
            where: {
                userId,
                id: folderId
            }
        })
    }

    public async findFolderByUserId(userId: string) {
        return await prisma.questFolder.findMany({
            where: {
                userId
            },
            include: {
                quests: true
            },
            orderBy: {
                name: "asc"
            }
        })
    }

    public async createFolder(userId: string, name: string, endedAt: string, description?: string) {
        return await prisma.questFolder.create({
            data: {
                name,
                description,
                userId,
                endedAt
            }
        })
    }

    public async updateFolder(folderId: string, userId: string, name: string, description?: string) {
        return await prisma.questFolder.update({
            where: {
                id: folderId,
                userId
            },
            data: {
                name,
                description
            }
        })
    }

    public async deleteFolderById(folderId: string) {
        return await prisma.questFolder.delete({
            where: {
                id: folderId
            }
        })
    }
}