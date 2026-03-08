import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import type { QuestRepository } from "./quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";
import { processExpGain } from "../../common/utils/leveling.js";

export class QuestService {
    constructor(
        private readonly questRepository: QuestRepository,
        private readonly userRepository: UserRepository,
        private readonly folderRepository: FolderRepository,
    ) { }

    public async findAllQuest(userId: string) {
        return await this.questRepository.findAll(userId);
    }

    public async updateCompleteQuest(questId: string, userId: string) {
        // Cek apakah quest dengan questId dan userId yang diberikan ada
        const quest = await this.questRepository.updateComplete(questId, new Date());
        if (!quest) throw new HTTPException(400, { message: "Gagal memperbarui quest" });

        // Cek apakah user dengan userId yang diberikan ada
        const user = await this.userRepository.findUserById(userId);
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });
        
        // cek apakah semua quest dalam folder telah selesai
        const remainingQuest = await this.questRepository.checkAllQuestInFolder(quest.folderId);
        if (remainingQuest.length > 0) {
            
        }

        // Leveling up solo leveling
        const levelUpUser = processExpGain({ ...user }, quest.expReward);
        await this.userRepository.updateUserLevelAndExp(userId, levelUpUser.newLevel, levelUpUser.remainingExp, levelUpUser.totalExp);

        return quest;

    }

    public async createQuest(userId: string, folderId: string, title: string, description: string, deadline: string) {
        // Cek apakah user dengan userId yang diberikan ada
        const user = await this.userRepository.findUserById(userId);
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });

        const existingQuest = await this.questRepository.findByUnique(folderId, title)
        if (existingQuest) throw new HTTPException(409, { message: "Quest dengan nama ini sudah ada di dalam folder" })

        const result = await this.questRepository.createQuest(folderId, title, description, deadline);
        if (!result) throw new HTTPException(400, { message: "Gagal membuat quest" });
        return result;
    }

    public async deleteQuest(questId: string) {
        const quest = await this.questRepository.findById(questId);
        if (!quest) throw new HTTPException(404, { message: "Quest tidak ditemukan" });
        const result = await this.questRepository.deleteQuest(questId);
        if (!result) throw new HTTPException(400, { message: "Gagal menghapus quest" });
        return result;
    }
}
