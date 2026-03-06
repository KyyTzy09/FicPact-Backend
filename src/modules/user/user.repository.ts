import type { User } from "@prisma/client"
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
            },
            omit: {
                password: true
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

    public async findUsersByLastReflectionDate(sevenDaysAgo: Date) {
        return await prisma.user.findMany({
            where: {
                lastReflection: {
                    lte: sevenDaysAgo
                }
            }
        })
    }

    public async findUserWithVerifyTokenExpiry(userId: string, expiredAt: Date) {
        return await prisma.user.findUnique({
            where: {
                id: userId,
                verificationTokenExpiry: {
                    gt: expiredAt
                }
            },
            omit: {
                password: true,
                resetPasswordToken: true,
                resetPasswordExpiry: true
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

    public async updateUsersLastReflection(userIds: string[], reflectionDate: Date) {
        return await prisma.user.updateMany({
            where: {
                id: {
                    in: userIds.map((userId) => userId)
                }
            },
            data: {
                lastReflection: reflectionDate
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

    public async verifyUser(userId: string) {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null
            }
        })
    }

    public async updateUserVerificationToken(userId: string, verificationToken: string, verificationTokenExpiry: Date) {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                verificationToken,
                verificationTokenExpiry
            },
            omit: {
                password: true,
                resetPasswordToken: true,
                resetPasswordExpiry: true
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
            },
            select: {
                id: true,
                resetPasswordToken: true,
                resetPasswordExpiry: true
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