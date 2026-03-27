import { HTTPException } from "hono/http-exception";
import { ReflectionGroupper } from "../../common/utils/reflection.js";
import type { UserRepository } from "../user/user.repository.js";
import type { ReflectionRepository } from "./reflection.repository.js";
import {
  QuestLevel,
  QuestReflectionType,
  type Quest,
  type User,
} from "@prisma/client";
import type { QuestRepository } from "../quest/quest.repository.js";
import type { FolderRepository } from "../folder/folder.repository.js";
import type { AIService } from "../ai/ai.service.js";
import type { AchievementService } from "../achievement/achievement.service.js";
import {
  generateWhatsappMessage,
  sendWhatsApp,
} from "../../common/utils/fonnte.js";
import type { NotificationService } from "../notification/notification.service.js";
import type { UserService } from "../user/user.service.js";
export class ReflectionService {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly questRepository: QuestRepository,
    private readonly reflectionRepository: ReflectionRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly achievementService: AchievementService,
    private readonly aiService: AIService,
    private readonly notificationService: NotificationService,
  ) {}

  // Dapatkan refleksi terbaru
  async GetLatestReflection(userId: string) {
    await this.userService.getUserById(userId);
    const latestReflection =
      await this.reflectionRepository.findLatestReflection(userId, 2);
    return latestReflection;
  }

  //  Ini Reflection Setelah Selesai atau Gagal menyelesaikan quest
  async CreateQuestReflection(
    userId: string,
    questId: string,
    reasons: string[],
    questStatus: boolean,
    questLevel: "HIGH" | "NORMAL" | "LOW",
    notificationId?: string,
  ) {
    const existingUser = await this.userService.getUserById(userId);

    const existingQuest = await this.questRepository.findById(questId);
    if (!existingQuest)
      throw new HTTPException(404, { message: "Quest tidak ditemukan" });

    const createdReflections =
      await this.reflectionRepository.createManyQuestReflection(
        questId,
        reasons,
        QuestLevel[questLevel],
        !questStatus ? QuestReflectionType.FAILED : QuestReflectionType.SUCCESS,
      );
    if (!createdReflections)
      throw new HTTPException(400, { message: "Gagal membuat refleksi" });

    const countRelectedQuest =
      await this.questRepository.countUserReflectedQuest(userId);
    if (countRelectedQuest >= 5)
      await this.achievementService.unlockAchievements(
        userId,
        countRelectedQuest,
        "reflection",
      );

    await this.userService.updateUserLevel(
      existingUser as User,
      userId,
      20,
      "reflection",
    );

    if (existingUser?.phone) {
      const message = generateWhatsappMessage("reflection", existingQuest.name);
      await sendWhatsApp(existingUser.phone, message);
    }

    if (questStatus === false && notificationId) {
      await this.notificationService.markNotificationAsDone(notificationId);
    }

    if (existingQuest.punishment && questStatus === false) {
      await this.notificationService.createNotification(
        userId,
        "Konsekuensi Menunggumu ⚔️",
        "Quest yang kamu abaikan tidak hilang begitu saja. Saatnya menyelesaikan punishment yang telah ditentukan.",
        "PUNISHMENT_REQUIRED",
        {
          questId: existingQuest.id,
          questName: existingQuest.name,
        },
      );
    }

    return createdReflections;
  }

  // async CreateUserFailedReflection(userId: string, reason: string[], addOns?: string) {
  //     const existingUser = await this.userRepository.findUserById(userId)
  //     if (!existingUser) throw new HTTPException(404, { message: "Pengguna tidak ditemukan" })

  //     const formatedReflection = reflectionFormatter(reason, addOns)
  //     const endPeriod = new Date();
  //     const startPeriod = new Date(endPeriod.getTime() - 7 * 24 * 60 * 60 * 1000);

  //     const createdReflection = await this.reflectionRepository.createReflection(userId, formatedReflection, startPeriod, endPeriod)
  //     if (!createdReflection) throw new HTTPException(400, { message: "Gagal membuat refleksi" })

  //     return createdReflection
  // }

  // async updateReflectionTrigger(userId: string, reflectionTriggerId: string, isReflection: boolean) {
  //     // Cari dulu RefleksiTrigger berdasarkan userId & id
  //     const existingReflectionTrigger = await this.notificationRepository.findPendingNotification(userId, "REFLECTION_TRIGGER")
  //     if (!existingReflectionTrigger) throw new HTTPException(404, { message: "Reflection trigger tidak ditemukan" })

  //     // Update status trigger
  //     const updatedReflectionTrigger = await this.reflectionRepository.updateReflectionTrigger(userId, reflectionTriggerId, isReflection)
  //     if (!updatedReflectionTrigger) throw new HTTPException(500, { message: "Gagal mengubah reflection trigger" })

  //     // Jika true langsung buat refleksi (Saran optimasi sih jalanin di background)
  //     if (updatedReflectionTrigger.isReflection) await this.CreateUserReflection(userId)
  //     return updatedReflectionTrigger
  // }

  // Ini Reflection AI
  async CreateUserReflection(userId: string, notificationId: string) {
    const existingUser = await this.userService.getUserById(userId);
    // Cari data quest sesuai dengan hari yang dipilih sebelumnya
    const endPeriod = new Date();
    const startPeriod = new Date(
      endPeriod.getTime() -
        (existingUser?.reflectionDays || 7) * 24 * 60 * 60 * 1000,
    );

    // Cari quest berdasarkan periode
    const existingQuest =
      await this.folderRepository.findUserFolderWithQuestReflectionByPeriod(
        userId,
        startPeriod,
        endPeriod,
      );

    // Grouping result jadi type yg di dukung AIService request
    const groupedResult = ReflectionGroupper(existingQuest);
    if (groupedResult.length === 0)
      throw new HTTPException(404, { message: "Data tidak ada" });

    // AI Generate Reflection
    const AIResult = await this.aiService.FetchAIReflection(groupedResult);
    if (!AIResult)
      throw new HTTPException(500, { message: "Refleksi tidak ada" });

    // Inset Ke table Reflection
    const createdReflection =
      await this.reflectionRepository.CreateAIReflection(userId, AIResult);
    if (!createdReflection)
      throw new HTTPException(400, { message: "Gagal membuat refleksi" });

    // Update Last reflection User
    await this.userRepository.updateUserLastReflection(
      userId,
      new Date(createdReflection.createdAt || endPeriod),
    );

    // Update Notification sebagai Done
    await this.notificationService.markNotificationAsDone(notificationId);

    // Kalau Reflection pertama ubah FirstReflection jadi false
    if (existingUser?.isFirstReflection)
      await this.userRepository.updateUserFirstReflection(userId);

    // Kirim ke wa kalau ada nomornya
    if (existingUser?.phone) {
      const message = generateWhatsappMessage("reflection-ai", AIResult);
      await sendWhatsApp(existingUser.phone, message);
    }
    return createdReflection;
  }
}
