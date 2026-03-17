import type { FolderStatus } from "@prisma/client";
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

    public async findUserFolderWithQuestReflectionByPeriod(userId: string, startDate: Date, endDate: Date) {
        return await prisma.questFolder.findMany({
            where: {
                userId,
                createdAt: {
                    lt: endDate,
                    gte: startDate
                },
            },
            include: {
                quests: {
                    include: {
                        reflection: {
                            select: {
                                questLevel: true,
                                reason: true,
                                type: true
                            }
                        }
                    }
                }
            }
        })
    }

    public async findFolderByUserIdAndId(userId: string, folderId: string) {
        return await prisma.questFolder.findUnique({
            where: {
                userId,
                id: folderId
            },
            include: {
                quests: true
            }
        })
    }

    public async findPendingFolderByUserId(userId: string) {
        return await prisma.questFolder.findMany({
            where: {
                userId,
                status: "PENDING"
            },
            include: {
                quests: true
            }
        })
    }

    public async findFolderByNames(userId: string, names: string) {
        return await prisma.questFolder.findMany({
            where: {
                userId,
                name: {
                    startsWith: names
                }
            },
            select: {
                name: true
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

    public async countFoldersByUserId(userId: string) {
        return await prisma.questFolder.count({
            where: {
                userId
            }
        })
    }

    public async findAvailableFoldersByUserId(userId: string) {
        return await prisma.questFolder.findMany({
            where: {
                userId,
                status: "PENDING"
            }
        })
    }

    public async updateStatus(folderId: string, status: FolderStatus) {
        return await prisma.questFolder.update({
            where: { id: folderId },
            data: { status: status },
        });
    }

    public async createFolder(userId: string, name: string, endedAt: string, description?: string, icon?: string, color?: string) {
        return await prisma.questFolder.create({
            data: {
                name,
                description,
                userId,
                endedAt,
                icon,
                color
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
