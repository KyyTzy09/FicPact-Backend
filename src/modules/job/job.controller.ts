import { Hono } from "hono";
import { UserRepository } from "../user/user.repository.js";
import { JobService } from "./job.service.js";
import { HttpResponse } from "../../common/utils/response.js";
import { QuestRepository } from "../quest/quest.repository.js";
import { describeRoute } from "hono-openapi";
import { NotificationRepository } from "../notification/notification.repository.js";
import { LeaderboardService } from "../leaderboards/leaderboard.service.js";

const userRepository = new UserRepository()
const notificationRepository = new NotificationRepository()
const questRepository = new QuestRepository()
const leaderBoardService = new LeaderboardService(userRepository)
const jobService = new JobService(userRepository, notificationRepository, questRepository, leaderBoardService)
// Sengaja ini di taruh di controller nanti ku bikin di servicenya soalnya ini masih belum 100% persen jobnya berhasil
export const jobController = new Hono()
    // Ini setiap 5 menit
    .post(
        "/reflection-trigger",
        describeRoute({
            tags: ["Job"],
            summary: "Trigger Reflection for Users",
            description: "Mencari user yang belum melakukan reflection di hari yang ditentukan dan membuat reflection trigger untuk mereka.",
        }),
        async (c) => {
            const result = await jobService.createReflectionTrigger()
            return HttpResponse(c, 200, "Reflection triggered successfully", result)
        }
    )
    // Ini setiap 10 menit
    .post(
        "/whatsapp-notification",
        describeRoute({
            tags: ["Job"],
            summary: "Send WhatsApp Notification for Pending Quests",
            description: "Mengirim notifikasi WhatsApp untuk quest yang pending (belum selesai) dan deadline-nya dalam 2 jam terakhir.",
        }),
        async (c) => {
            const result = await jobService.whatshappNotification()
            return HttpResponse(c, 200, "Whatsapp notification sent successfully", result)
        }
    )
    // Ini setiap 10 menit
    .post(
        "/quest-failed-notification",
        describeRoute({
            tags: ["Job"],
            summary: "Send Notifications for Failed Quests",
            description: "Mengirim notifikasi untuk quest yang gagal (failed) dan deadline-nya sudah lewat.",
        }),
        async (c) => {
            const result = await jobService.createFailedQuestNotification()
            return HttpResponse(c, 200, "Notification sent successfully", result)
        }
    )
    // Ini setiap jam 3 sore
    .post("/update-weekly",
        describeRoute({
            tags: ["Job"],
            summary: "Update Weekly Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        async (c) => {
            const result = await jobService.createWeeklyLeaderboard();
            return HttpResponse(c, 200, "Leaderboard updated successfully", result)
        }
    )
    // Ini setiap 1 bulan sekali di tanggal 1 jam 3 sore
    .post("/update-monthly",
        describeRoute({
            tags: ["Job"],
            summary: "Update Monthly Leaderboard",
            security: [{ bearerAuth: [] }],
        }),
        async (c) => {
            const result = await jobService.createMonthlyLeaderboard();
            return HttpResponse(c, 200, "Leaderboard updated successfully", result)
        }
    )