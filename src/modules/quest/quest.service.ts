import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import type { QuestRepository } from "./quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";
import { processExpGain } from "../../common/utils/leveling.js";
import { AIService } from "../ai/ai.service.js";
import { getNextFolderName } from "../../common/utils/name.js";
import type { AchievementService } from "../achievement/achievement.service.js";
import type { UserService } from "../user/user.service.js";
import { generateWhatsappMessage, sendWhatsApp } from "../../common/utils/fonnte.js";

export class QuestService {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly userRepository: UserRepository,
    private readonly folderRepository: FolderRepository,
    private readonly userService: UserService,
    private readonly achievementService: AchievementService,
    private readonly aiService: AIService,
  ) { }

  public async findAllQuest(userId: string) {
    const quests = await this.questRepository.findAll(userId);
    const questWithStatus = await Promise.all(
      quests.map(async (quest) => {
        if (!quest.completedAt && quest.deadLineAt <= new Date()) {
          return { ...quest, status: "FAILED" }
        }

        if (quest.completedAt) {
          return { ...quest, status: "COMPLETED" }
        }

        return { ...quest, status: "ONGOING" }
      })
    )

    const groupedQuest = questWithStatus.reduce((acc, quest) => {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)

      const startOfTomorrow = new Date(startOfToday)
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

      const startOfDayAfterTomorrow = new Date(startOfTomorrow)
      startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 1)
      const deadline = new Date(quest.deadLineAt)

      const push = (key: string) => {
        if (!acc[key]) acc[key] = []
        acc[key].push(quest)
      }

      // ===== GROUP BY DATE =====
      if (deadline >= startOfToday && deadline < startOfTomorrow) {
        push("TODAY")
      }
      else if (deadline >= startOfTomorrow && deadline < startOfDayAfterTomorrow) {
        push("TOMORROW")
      }
      else if (quest.status === "ONGOING") {
        push("ONGOING")
      }

      // ===== GROUP BY STATUS =====
      if (quest.status === "COMPLETED") {
        push("COMPLETED")
      }

      if (quest.status === "FAILED") {
        push("FAILED")
      }

      return acc
    }, {} as Record<string, typeof questWithStatus>)

    return Object.entries(groupedQuest).map(([key, quests]) => ({ key, quests }))
  }

  public async createQuestWithVoice(
    userId: string,
    text: string,
    mode: "with-folder" | "task-only"
  ) {
    const createFolder = mode === "with-folder"

    const availableFolders =
      await this.folderRepository.findPendingFolderByUserId(userId)

    const AIResult = await this.aiService.FetchAICreateQuest({
      text,
      folder: availableFolders,
      create_folder: createFolder
    })

    if (!AIResult) {
      throw new HTTPException(500, { message: "Gagal menghubungkan ke AI" })
    }

    if (AIResult.action === "create_folder_with_quests") {
      if (!AIResult.folder?.name) {
        throw new HTTPException(400, { message: "AI tidak memberikan nama folder" })
      }

      const existingFolders =
        await this.folderRepository.findFolderByNames(userId, AIResult.folder.name)

      const name = getNextFolderName(
        AIResult.folder.name,
        existingFolders.map(f => f.name)
      )

      const createdFolder = await this.folderRepository.createFolder(
        userId,
        name,
        AIResult.folder.endDate || "",
        AIResult.folder.description || "",
        AIResult.folder.icon || "",
        AIResult.folder.color || ""
      )

      await this.questRepository.createBatchQuest(
        createdFolder.id,
        AIResult.quests || []
      )

      return createdFolder
    }

    if (!AIResult.folderId) {
      throw new HTTPException(400, { message: "AI tidak memberikan folderId" })
    }

    const folder = await this.folderRepository.findFolderByUserIdAndId(
      userId,
      AIResult.folderId
    )

    if (!folder) {
      throw new HTTPException(404, { message: "Folder tidak ditemukan" })
    }

    await this.questRepository.createBatchQuest(folder.id, AIResult.quests || [])

    return folder
  }

  public async updateCompleteQuest(questId: string, userId: string) {
    const existingQuest = await this.questRepository.findById(questId);
    if (!existingQuest) throw new HTTPException(404, { message: "Quest tidak ditemukan" });

    if (existingQuest.isSuccess) return existingQuest;

    const quest = await this.questRepository.updateComplete(questId, new Date());
    if (!quest) throw new HTTPException(400, { message: "Gagal memperbarui quest" });

    const user = await this.userRepository.findUserQuests(userId);
    if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });

    // level up user
    await this.userService.updateLevelAfterQuest(user, userId, quest);

    // ambil user terbaru setelah level up
    const updatedUser = await this.userRepository.findUserQuests(userId);

    const completedQuests = updatedUser!.questFolders
      .flatMap(folder => folder.quests)
      .filter(q => q.isSuccess).length;

    if (completedQuests >= 1) {
      await this.achievementService.unlockAchievements(userId, completedQuests, "quest")
    }

    if (user.phone) {
      const message = generateWhatsappMessage("quest_completed", quest.name)
      await sendWhatsApp(user.phone, message)
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
