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

    public async command(text: string) {
        // nanti di sini data kirim ke AI
        //
        //
        // HARAPAN DATA DARI AI ITU DATA JSON SEPERTI INI
        //
        //
        // {
        //   "action": "create_folder_with_quests",
        //   "folder": {
        //     "name": "Belajar Ulangan",
        //     "description": "Persiapan ulangan"
        //   },
        //   "quests": [
        //     {
        //       "name": "Belajar Matematika",
        //       "description": "Review materi integral",
        //       "expReward": 20,
        //       "deadLineAt": "2026-03-20T18:00:00Z"
        //     },
        //     {
        //       "name": "Belajar Fisika",
        //       "description": "Latihan soal mekanika",
        //       "expReward": 20,
        //       "deadLineAt": "2026-03-20T18:00:00Z"
        //     }
        //   ]
        // }
        //
        //
        //
        // Kirim data ke DB
    }
}
