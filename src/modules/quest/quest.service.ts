import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import type { QuestRepository } from "./quest.repository.js";
import { processExpGain } from "../../common/utils/leveling.js";

export class QuestService {
    constructor(
        private readonly questRepository: QuestRepository,
        private readonly userRepository: UserRepository,
    ) { }

    public async findAllQuest(userId: string) {
        return await this.questRepository.findAll(userId);
    }

    public async updateCompleteQuest(questId: string, userId: string) {
        // Cek apakah quest dengan questId dan userId yang diberikan ada
        const quest = await this.questRepository.updateComplete(questId);
        if (!quest) throw new HTTPException(400, { message: "Gagal memperbarui quest" });

        // Cek apakah user dengan userId yang diberikan ada
        const user = await this.userRepository.findUserById(userId);
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });

        // Leveling up solo leveling
        const levelUpUser = processExpGain({ ...user}, quest.expReward);
        await this.userRepository.updateUserLevelAndExp(userId, levelUpUser.newLevel, levelUpUser.remainingExp, levelUpUser.totalExp);

        return quest;

    }
}
