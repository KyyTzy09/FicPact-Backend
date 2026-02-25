import { Hono } from "hono";
import { ReflectionRepository } from "../reflection/reflection.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { prisma } from "../../common/utils/prisma.js";

const userRepository = new UserRepository()
const reflectionRepository = new ReflectionRepository()

// Sengaja ini di taruh di controller nanti ku bikin di servicenya soalnya ini masih belum 100% persen jobnya berhasil
export const jobController = new Hono()
    .post(
        "/reflection-trigger",
        async (c) => {
            const now = new Date()
            const sevenDaysAgo = new Date(now)
            sevenDaysAgo.setDate(now.getDate() - 7)
            // Cari semua User dengan LTE last reflection
            const users = await prisma.user.findMany({
                where: {
                    lastReflection: {
                        lte: sevenDaysAgo
                    }
                }
            })

            // Loop user dari data query
            for (const user of users) {
                // generate reflection trigger untuk user tersebut
                await prisma.reflectionTrigger.create({
                    data: {
                        userId: user.id,
                    }
                })

                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        lastReflection: now
                    }
                })
            }

            // kirim wa(OPTIONAL) 
        }
    )
    .post(
        "/whatsapp-notification",
        async (c) => {
            // 
        }
    )