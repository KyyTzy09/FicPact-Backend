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

    public async createFolder(userId: string, name: string, description?: string) {
        return await prisma.questFolder.create({
            data: {
                name,
                description,
                userId
            }
        })
    }
}