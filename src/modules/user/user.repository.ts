import { prisma } from "../../common/utils/prisma.js"

export class UserRepository {
    public async createUser(email: string, password: string) {
        return prisma.user.create({
            data: {
                email,
                password
            }
        })
    }

    public async findUserById(userId: string) {
        return await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
    }

    public async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    public async updateUserLevelAndExp(userId: string, newLevel: number, remainingExp: number, totalExp: number) {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                level: newLevel,
                currentExp: remainingExp,
                totalExp
            }
        })
    }

    public async updateUserLastReflection(userId: string, reflectionDate: Date) {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                lastReflection: reflectionDate
            }
        })
    }
}