import { HTTPException } from "hono/http-exception";
import { reflectionFormatter } from "../../common/utils/reflection.js";
import type { UserRepository } from "../user/user.repository.js";
import type { ReflectionRepository } from "./reflection.repository.js";
import { Prisma, QuestLevel, QuestReflectionType, type Quest } from "@prisma/client";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";

type QuestFolderType = Prisma.QuestFolderGetPayload<{ include: { quests: { include: { reflection: true } } } }>

export class ReflectionService {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly questRepository: QuestRepository,
        private readonly reflectionRepository: ReflectionRepository,
        private readonly userRepository: UserRepository
    ) { }

    private ReflectionGroupper(reflectionData: QuestFolderType[]) {

        return reflectionData.flatMap((folder) =>
            folder.quests.map((quest) => {
                const diffMs = quest.completedAt && quest.createdAt
                    ? (new Date(quest.completedAt).getTime() - new Date(quest.createdAt).getTime()) / 1000 / 60
                    : null
                const minutes = (diffMs! / 1000 / 60);
                const cleanMinute = Math.max(1, Math.round(minutes));
                return {
                    folder: folder.name,
                    isSuccess: quest.isSuccess,
                    deadline: quest.deadLineAt,
                    completedAt: quest.completedAt,
                    estimatedMin: cleanMinute,
                    reflections: quest.reflection
                }
            })
        );
    }

    //     export function ChatGrouper(data: { chat: Chat, user: AliasType }[]) {
    //     return data.reduce((acc, data) => {
    //         const dateKey = format(new Date(data?.chat?.createdAt!), "MM/dd/yyyy");

    //         if (!acc[dateKey]) {
    //             acc[dateKey] = [];
    //         }

    //         acc[dateKey].push({
    //             chat: data.chat!,
    //             user: data.user
    //         });

    //         return acc;
    //     }, {} as Record<string, { chat: Chat; user: AliasType }[]>)
    // }

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

        const groupedResult = this.ReflectionGroupper(existingQuest)

        return groupedResult
    }
}