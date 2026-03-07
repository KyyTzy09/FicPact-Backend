import { Hono } from "hono";
import { ReflectionRepository } from "../reflection/reflection.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { prisma } from "../../common/utils/prisma.js";
import { JobService } from "./job.service.js";
import { HttpResponse } from "../../common/utils/response.js";
import { QuestRepository } from "../quest/quest.repository.js";

const userRepository = new UserRepository()
const reflectionRepository = new ReflectionRepository()
const questRepository = new QuestRepository()
const jobService = new JobService(userRepository, reflectionRepository, questRepository)
// Sengaja ini di taruh di controller nanti ku bikin di servicenya soalnya ini masih belum 100% persen jobnya berhasil
export const jobController = new Hono()
    .post(
        "/reflection-trigger",
        async (c) => {
            const result = await jobService.reflectionTrigger()
            return HttpResponse(c, 200, "Reflection triggered successfully", result)
        }
    )
    .post(
        "/whatsapp-notification",
        async (c) => {
            // 
        }
    )