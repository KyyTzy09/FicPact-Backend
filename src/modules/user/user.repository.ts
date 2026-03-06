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

    public async findUsersByResetPassTokenExpiry(resetPassTokenExpiry: Date) {
        return prisma.user.findMany({
            where: {
                resetPasswordExpiry: {
                    gt: resetPassTokenExpiry
                }
            }
        })
    }

    public async upsertUser(email: string) {
        return await prisma.user.upsert({
            where: {
                email
            },
            create: {
                email,
            },
            update: {
                email
            }
        })
    }

    public async updateUserPassword(id: string, password: string) {
        return await prisma.user.update({
            where: {
                id
            },
            data: {
                password,
                resetPasswordToken: null,
                resetPasswordExpiry: null
            }
        })
    }

    public async updateResetPassToken(email: string, resetPassToken: string, resetPassTokenExp: Date) {
        return await prisma.user.update({
            where: {
                email
            },
            data: {
                resetPasswordToken: resetPassToken,
                resetPasswordExpiry: resetPassTokenExp,
            },
            select: {
                id: true,
                resetPasswordToken: true,
                resetPasswordExpiry: true
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