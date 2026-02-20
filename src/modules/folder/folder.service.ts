import { HTTPException } from "hono/http-exception";
import type { FolderRepository } from "./folder.repository.js";

export class FolderService {
    constructor(private readonly folderRepository: FolderRepository) {
    }

    public async GetUserQuestFolder(userId: string) {
        const existingFolder = await this.folderRepository.findFolderByUserId(userId)
        if (existingFolder.length === 0) throw new HTTPException(404, { message: "Belum ada folder tersedia" })

        return existingFolder
    }

    public async GetFolderById(userId: string, folderId: string) {
        const existingFolder = await this.folderRepository.findFolderByUserIdAndId(userId, folderId)
        if (!existingFolder) throw new HTTPException(404, { message: "Folder tidak ditemukan" })

        return existingFolder
    }

    public async CreateQuestFolder(userId: string, name: string, description?: string) {
        const existingFolder = await this.folderRepository.findFolderByName(userId, name)
        if (existingFolder) throw new HTTPException(409, { message: "Folder dengan nama ini sudah ada" })

        const createdFolder = await this.folderRepository.createFolder(userId, name, description)
        if (!createdFolder) throw new HTTPException(400, { message: "Gagal membuat user" })

        return createdFolder
    }
}