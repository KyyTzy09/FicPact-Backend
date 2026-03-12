import type { Prisma, QuestLevel, QuestReflectionType } from "@prisma/client"

export type AIReflectionPayload = {
  folder: string
  isSuccess: boolean
  deadline: Date
  completedAt: Date | null
  estimatedMin: number
  reflections: {
    type: QuestReflectionType
    reason: string
    questLevel: QuestLevel
  }[]
}

export type AICreateQuestPayload = {
  text: string
  folder: Prisma.QuestFolderGetPayload<{ include: { quests: true } }>[]
  create_folder: boolean
}

export type AICreateQuestResponse = {
  action: "create_folder_with_quests" | "create_quests_only"
  folderId?: string
  folder?: {
    name: string
    description: string | null
    icon: string | null
    color: string | null
    endDate: string | null
  }
  quests: {
    name: string
    description: string | null
    expReward: number
    deadLineAt: Date
  }[]
}
