import { AI_API_BASE_URL, AI_API_TOKEN } from "../../common/utils/env.js";
import type {
  AICreateQuestPayload,
  AICreateQuestResponse,
  AIReflectionPayload,
} from "../../common/external/ai.type.js";

export class AIService {
  async FetchAIReflection(data: AIReflectionPayload[]): Promise<string> {
    const response = await fetch(`${AI_API_BASE_URL}/reflection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_TOKEN}`,
      },
      body: JSON.stringify({
        histories: data,
      }),
    });

    const result = await response.json();
    return result.data as string;
  }

  public async FetchAICreateQuest(
    payload: AICreateQuestPayload,
  ): Promise<AICreateQuestResponse> {
    const response = await fetch(`${AI_API_BASE_URL}/quest/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_TOKEN}`,
      },
      body: JSON.stringify({
        text: payload.text,
        folder: payload.folder,
        create_folder: payload.create_folder,
      }),
    });

    const result = await response.json();
    return result.data as AICreateQuestResponse;
  }
}
