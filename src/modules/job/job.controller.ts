import { Hono } from "hono";
import { ReflectionRepository } from "../reflection/reflection.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { prisma } from "../../common/utils/prisma.js";
import { JobService } from "./job.service.js";
import { HttpResponse } from "../../common/utils/response.js";
import { QuestRepository } from "../quest/quest.repository.js";
import { describeRoute } from "hono-openapi";

const userRepository = new UserRepository()
const reflectionRepository = new ReflectionRepository()
const questRepository = new QuestRepository()
const jobService = new JobService(userRepository, reflectionRepository, questRepository)
// Sengaja ini di taruh di controller nanti ku bikin di servicenya soalnya ini masih belum 100% persen jobnya berhasil
export const jobController = new Hono()
    .post(
        "/reflection-trigger",
        describeRoute({
            tags: ["Job"],
            summary: "Trigger Reflection for Users",
            description: "Mencari user yang belum melakukan reflection dalam 7 hari terakhir dan membuat reflection trigger untuk mereka. Endpoint ini juga akan update tanggal terakhir reflection user.",
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
            description: "Mencari user yang belum melakukan reflection dalam 7 hari terakhir dan memiliki nomor phone terdaftar. Kemudian mengirim notifikasi WhatsApp untuk quest yang pending (belum selesai) dan deadline-nya dalam 2 jam terakhir.",
            security: [{ bearerAuth: [] }],
        }),
        async (c) => {
            const result = await jobService.whatshappNotification()
            return HttpResponse(c, 200, "Whatsapp notification sent successfully", result)
        }
    )