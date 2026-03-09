import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import type { QuestRepository } from "./quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";
import { processExpGain } from "../../common/utils/leveling.js";
import type { AchievementRepository } from "../achievement/achievement.repository.js";

export class QuestService {
    constructor(
        private readonly questRepository: QuestRepository,
        private readonly userRepository: UserRepository,
        private readonly folderRepository: FolderRepository,
        private readonly achievementRepository: AchievementRepository,
    ) { }

    public async findAllQuest(userId: string) {
        return await this.questRepository.findAll(userId);
    }

    public async updateCompleteQuest(questId: string, userId: string) {
        const existingQuest = await this.questRepository.findPendingQuests(questId);
        if (!existingQuest) throw new HTTPException(404, { message: "Quest tidak ditemukan" });

        const quest = await this.questRepository.updateComplete(questId, new Date());
        if (!quest) throw new HTTPException(400, { message: "Gagal memperbarui quest" });

        const user = await this.userRepository.findUserQuests(userId);
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });

        // level up user
        const levelUpUser = processExpGain({ ...user }, quest.expReward);

        await this.userRepository.updateUserLevelAndExp(
            userId,
            levelUpUser.newLevel,
            levelUpUser.remainingExp,
            levelUpUser.totalExp
        );

        // ambil user terbaru setelah level up
        const updatedUser = await this.userRepository.findUserQuests(userId);

        const completedQuests = updatedUser!.questFolders
            .flatMap(folder => folder.quests)
            .filter(q => q.isSuccess).length;

        const achievements = await this.achievementRepository.getAchievements();

        for (const achievement of achievements) {
            let unlocked = false;

            if (achievement.criteria === "complete_first_quest") {
                unlocked = completedQuests >= 1;
            }

            if (achievement.criteria === "complete_10_quests") {
                unlocked = completedQuests >= 10;
            }

            if (achievement.criteria === "reach_level_5") {
                unlocked = updatedUser!.level >= 5;
            }

            if (!unlocked) continue;

            await this.achievementRepository.unlockAchievement(userId, achievement.id);
        }

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
