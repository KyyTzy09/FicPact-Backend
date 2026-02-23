import type { Prisma } from "@prisma/client";

export function reflectionFormatter(reason: string[], addOns?: string) {
    const result = `Saya mengalami kegagalan dalam menyelesaikan quest quest yang saya buat dikarenakan:
        ${reason.map((v) => {
        return `- ${v}`
    }).join("\n")}
    Tambahan: ${addOns}`

    return result
}

type QuestFolderType = Prisma.QuestFolderGetPayload<{ include: { quests: { include: { reflection: true } } } }>
export function ReflectionGroupper(reflectionData: QuestFolderType[]) {
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