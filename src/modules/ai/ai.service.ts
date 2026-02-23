import type { QuestLevel, QuestReflectionType } from "@prisma/client"
import { AI_API_BASE_URL, AI_API_TOKEN } from "../../common/utils/env.js"

type AIReflectionPayload = {
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

export class AIService {
    async FetchAIReflection(data: AIReflectionPayload[]): Promise<string> {
        const response = await fetch(`${AI_API_BASE_URL}/reflection`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_API_TOKEN}`,
            },
            body: JSON.stringify({
                histories: data
            }),
        });

        const result = await response.json();
        return result.data as string

    }
}