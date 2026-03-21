import { HTTPException } from "hono/http-exception";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { PunishmentRepository } from "./punishment.repository.js";
import { QuestPunishmentStatus, type User } from "@prisma/client";
import type { UserService } from "../user/user.service.js";

export class PunishmentService {
    constructor(private readonly punishmentRepository: PunishmentRepository, private readonly questRepository: QuestRepository, private readonly userService: UserService) { }

    async getQuestPunishment(questId: string, userId: string) {
        const existingQuest = await this.questRepository.findById(questId);
        if (!existingQuest) throw new HTTPException(404, { message: "Quest tidak ditemukan" });

        const existingPunishment = await this.punishmentRepository.findPunishmentByUserId(questId, userId);
        if (!existingPunishment) throw new HTTPException(404, { message: "Hukuman tidak ditemukan" });

        return existingPunishment;
    }

    async createPunishment(questId: string, userId: string, name: string, deadlineAt: Date) {
        const existingQuest = await this.questRepository.findById(questId);
        if (!existingQuest) throw new HTTPException(404, { message: "Quest tidak ditemukan" });

        const createdPunishment = await this.punishmentRepository.createPunishment(questId, userId, name, deadlineAt);
        if (!createdPunishment) throw new HTTPException(400, { message: "Gagal membuat hukuman" });

        return createdPunishment;
    }

    async updatePunishmentStatus(questId: string, userId: string, status: boolean) {
        const user = await this.userService.getUserById(userId);
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });

        const existingPunishment = await this.punishmentRepository.findPunishmentByUserId(questId, userId);
        if (!existingPunishment) throw new HTTPException(404, { message: "Hukuman tidak ditemukan" });

        const punishmentStatus: QuestPunishmentStatus = status ? QuestPunishmentStatus.COMPLETED : QuestPunishmentStatus.FAILED;
        if (punishmentStatus === QuestPunishmentStatus.FAILED) {
            await this.userService.updateUserLevel(user, userId, -20, "quest");
        } else {
            await this.userService.updateUserLevel(user, userId, 10, "quest");
        }

        const updatedPunishment = await this.punishmentRepository.updatePunishmentStatus(questId, punishmentStatus);
        if (!updatedPunishment) throw new HTTPException(400, { message: "Gagal memperbarui hukuman" });

        return updatedPunishment;
    }
}