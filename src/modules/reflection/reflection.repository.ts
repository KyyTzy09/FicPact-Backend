import { prisma } from "../../common/utils/prisma.js";

export class ReflectionRepository {
    async createReflection(userId: string, content: string, startPeriod: Date, endPeriod: Date) {
        return await prisma.reflection.create({
            data: {
                userId,
                type: "USER",
                content,
                startPeriod,
                endPeriod
            }
        })
    }
}