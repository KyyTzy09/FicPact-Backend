import { HTTPException } from "hono/http-exception";
import { reflectionFormatter } from "../../common/utils/reflection.js";
import type { UserRepository } from "../user/user.repository.js";
import type { ReflectionRepository } from "./reflection.repository.js";
import { QuestLevel, QuestReflectionType } from "@prisma/client";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";

export class ReflectionService {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly questRepository: QuestRepository,
        private readonly reflectionRepository: ReflectionRepository,
        private readonly userRepository: UserRepository
    ) { }

    async GetLatestReflection(userId: string) {
        const existingUser = await this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "Pengguna tidak ditemukan" })

        const latestReflection = await this.reflectionRepository.findLatestReflection(userId, 2)
        return latestReflection
    }

    async CreateQuestReflection(questId: string, reasons: string[], questStatus: boolean, questLevel: "HIGH" | "NORMAL" | "LOW") {
        const existingUser = await this.questRepository.findById(questId)
        if (!existingUser) throw new HTTPException(404, { message: "Quest tidak ditemukan" })

        const createdReflections = await this.reflectionRepository.createManyQuestReflection(questId, reasons, QuestLevel[questLevel], !questStatus ? QuestReflectionType.FAILED : QuestReflectionType.SUCCESS)
        return createdReflections
    }

    async CreateUserFailedReflection(userId: string, reason: string[], addOns?: string) {
        const existingUser = await this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "Pengguna tidak ditemukan" })

        const formatedReflection = reflectionFormatter(reason, addOns)
        const endPeriod = new Date();
        const startPeriod = new Date(endPeriod.getTime() - 7 * 24 * 60 * 60 * 1000);

        const createdReflection = await this.reflectionRepository.createReflection(userId, formatedReflection, startPeriod, endPeriod)
        if (!createdReflection) throw new HTTPException(400, { message: "Gagal membuat refleksi" })

        return createdReflection
    }

    async CreateUserWeklyReflection(userId: string) {
        const endPeriod = new Date();
        const startPeriod = new Date(endPeriod.getTime() - 7 * 24 * 60 * 60 * 1000);
        const existingQuest = await this.folderRepository.findUserFolderWithQuestReflection(userId, startPeriod, endPeriod)
        return existingQuest
    }
}