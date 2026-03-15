import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import type { QuestRepository } from "./quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";
import { processExpGain } from "../../common/utils/leveling.js";
import type { AchievementRepository } from "../achievement/achievement.repository.js";
import { use } from "hono/jsx";
import { AIService } from "../ai/ai.service.js";
import { getNextFolderName } from "../../common/utils/name.js";

export class QuestService {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly userRepository: UserRepository,
    private readonly folderRepository: FolderRepository,
    private readonly achievementRepository: AchievementRepository,
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
    // const existingQuest = await this.questRepository.findPendingQuests(questId);
    // if (!existingQuest) throw new HTTPException(404, { message: "Quest tidak ditemukan" });

    const quest = await this.questRepository.updateComplete(questId, new Date());
    if (!quest) throw new HTTPException(400, { message: "Gagal memperbarui quest" });

    const user = await this.userRepository.findUserQuests(userId);
    if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" });

    // level up user
    const levelUpUser = processExpGain({ ...user }, quest.expReward);

    await this.userRepository.updateUserLevelAndExp(
      userId,
      levelUpUser.newLevel,
      levelUpUser.remainingExp,
      levelUpUser.totalExp,
      levelUpUser.expToNextLevel
    );

    // ambil user terbaru setelah level up
    const updatedUser = await this.userRepository.findUserQuests(userId);

    const completedQuests = updatedUser!.questFolders
      .flatMap(folder => folder.quests)
      .filter(q => q.isSuccess).length;

    const achievements = await this.achievementRepository.getAchievements();

    for (const achievement of achievements) {
      let unlocked = false;

      if (achievement.criteria === "complete_first_quest") {
        unlocked = completedQuests >= 1;
      }

      if (achievement.criteria === "complete_5_quests") {
        unlocked = completedQuests >= 5;
      }

      if (achievement.criteria === "complete_10_quests") {
        unlocked = completedQuests >= 10;
      }

      if (achievement.criteria === "reach_level_5") {
        unlocked = updatedUser!.level >= 5;
      }

      if (!unlocked) continue;

      await this.achievementRepository.unlockAchievement(userId, achievement.id);
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
