import { Hono } from "hono";
import { ReflectionRepository } from "../reflection/reflection.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { prisma } from "../../common/utils/prisma.js";
import { JobService } from "./job.service.js";
import { HttpResponse } from "../../common/utils/response.js";
import { QuestRepository } from "../quest/quest.repository.js";
import { describeRoute } from "hono-openapi";
import { NotificationRepository } from "../notification/notification.repository.js";

const userRepository = new UserRepository()
const notificationRepository = new NotificationRepository()
const questRepository = new QuestRepository()
const jobService = new JobService(userRepository, notificationRepository , questRepository)
// Sengaja ini di taruh di controller nanti ku bikin di servicenya soalnya ini masih belum 100% persen jobnya berhasil
export const jobController = new Hono()
    .post(
        "/reflection-trigger",
        describeRoute({
            tags: ["Job"],
            summary: "Trigger Reflection for Users",
            description: "Mencari user yang belum melakukan reflection di hari yang ditentukan dan membuat reflection trigger untuk mereka.",
            security: [{ bearerAuth: [] }],
        }),
        async (c) => {
            const result = await jobService.createReflectionTrigger()
            return HttpResponse(c, 200, "Reflection triggered successfully", result)
        }
    )
    .post(
        "/whatsapp-notification",
        describeRoute({
            tags: ["Job"],
            summary: "Send WhatsApp Notification for Pending Quests",
            description: "Mengirim notifikasi WhatsApp untuk quest yang pending (belum selesai) dan deadline-nya dalam 2 jam terakhir.",
            security: [{ bearerAuth: [] }],
        }),
        async (c) => {
            const result = await jobService.whatshappNotification()
            return HttpResponse(c, 200, "Whatsapp notification sent successfully", result)
        }
    )