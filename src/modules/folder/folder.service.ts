import { HTTPException } from "hono/http-exception";
import type { FolderRepository } from "./folder.repository.js";

export class FolderService {
    constructor(private readonly folderRepository: FolderRepository) {
    }

    public async CreateQuestFolder(userId: string, name: string, description?: string) {
        const existingFolder = await this.folderRepository.findFolderByName(userId, name)
        if (existingFolder) throw new HTTPException(409, { message: "Folder dengan nama ini sudah ada" })

        const createdFolder = await this.folderRepository.createFolder(userId, name, description)
        if (!createdFolder) throw new HTTPException(400, { message: "Gagal membuat user" })

        return createdFolder
    }
}