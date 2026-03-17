import { HTTPException } from "hono/http-exception";
import type { FolderRepository } from "./folder.repository.js";
import type { FolderStatus } from "@prisma/client";
import type { AchievementService } from "../achievement/achievement.service.js";

export class FolderService {
    constructor(private readonly folderRepository: FolderRepository, private readonly achievementService: AchievementService) {
    }

    public async GetUserQuestFolder(userId: string) {
        // Ambil semua folder beserta quests milik user
        const folders = await this.folderRepository.findFolderByUserId(userId);
        if (!folders) return [];

        const now = new Date(); // Waktu sekarang untuk cek deadline / expired

        // Iterasi semua folder untuk update status jika perlu
        const updatedFolders = await Promise.all(
            folders.map(async (folder) => {
                let newStatus: FolderStatus | null = null; // Placeholder untuk status baru folder

                const totalQuests = folder.quests.length; // Total quest di folder
                const completedQuests = folder.quests.filter(q => q.isSuccess).length; // Quest yang berhasil
                const failedQuests = folder.quests.filter(q => !q.isSuccess && q.completedAt).length; // Quest gagal
                const expiredQuests = folder.quests.filter(q => !q.isSuccess && q.deadLineAt < now).length; // Quest lewat deadline tapi belum selesai

                // 1️⃣ Semua quest berhasil → set folder COMPLETED
                if (completedQuests === totalQuests && totalQuests > 0) {
                    newStatus = "COMPLETED";
                }
                // 2️⃣ Semua quest gagal → set folder FAILED
                else if (failedQuests === totalQuests && totalQuests > 0) {
                    newStatus = "FAILED";
                }
                // 3️⃣ Ada quest melewati deadline → set folder EXPIRED
                else if (expiredQuests > 0) {
                    newStatus = "EXPIRED";
                }

                // Update folder di DB jika status baru berbeda dari yang sekarang
                if (newStatus && folder.status !== newStatus) {
                    console.log(`Updating folder ${folder.id} status to ${newStatus}`);
                    await this.folderRepository.updateStatus(folder.id, newStatus);
                    folder.status = newStatus; // Update di object juga supaya return data terbaru
                }

                // Kembalikan folder dengan tambahan properti taskCount
                return {
                    ...folder,
                    taskCount: totalQuests
                };
            })
        );

        // Return semua folder user dengan status terbaru dan taskCount
        return updatedFolders;
    }

    public async GetUserAvailableFolders(userId: string) {
        return await this.folderRepository.findAvailableFoldersByUserId(userId)
    }

    public async GetFolderById(userId: string, folderId: string) {
        const existingFolder = await this.folderRepository.findFolderByUserIdAndId(userId, folderId)
        if (!existingFolder) throw new HTTPException(404, { message: "Folder tidak ditemukan" })

        return existingFolder
    }

    public async CreateQuestFolder(userId: string, name: string, endedAt: string, description?: string, icon?: string, color?: string) {
        const existingFolder = await this.folderRepository.findFolderByName(userId, name)
        if (existingFolder) throw new HTTPException(409, { message: "Folder dengan nama ini sudah ada" })

        const createdFolder = await this.folderRepository.createFolder(userId, name, endedAt, description, icon, color)
        if (!createdFolder) throw new HTTPException(400, { message: "Gagal membuat folder" })
        const countUserFolders = await this.folderRepository.countFoldersByUserId(userId)

        if (countUserFolders >= 1) {
            await this.achievementService.unlockAchievements(userId, countUserFolders, "folder")
        }

        return createdFolder
    }

    public async UpdateQuestFolder(folderId: string, userId: string, name: string, description?: string) {
        const folder = await this.folderRepository.findFolderByUserIdAndId(userId, folderId)
        if (!folder) throw new HTTPException(404, { message: "Folder tidak ditemukan" })

        const existingFolder = await this.folderRepository.findFolderByName(userId, name)
        if (name !== folder.name && existingFolder) throw new HTTPException(409, { message: "Folder dengan nama ini sudah ada" })

        const updatedFolder = await this.folderRepository.updateFolder(folderId, userId, name, description)
        if (!updatedFolder) throw new HTTPException(400, { message: "Gagal memperbarui folder" })

        return updatedFolder
    }

    public async DeleteQuestFolderById(folderId: string, userId: string) {
        const existingFolder = await this.folderRepository.findFolderByUserIdAndId(userId, folderId)
        if (!existingFolder) throw new HTTPException(404, { message: "Folder tidak ditemukan" })

        const deletedFolder = await this.folderRepository.deleteFolderById(folderId)
        if (!deletedFolder) throw new HTTPException(400, { message: "Gagal menghapus folder" })

        return deletedFolder
    }
}
