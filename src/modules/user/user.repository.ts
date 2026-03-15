import type { User, VerificationTokenType } from "@prisma/client";
import { prisma } from "../../common/utils/prisma.js";

export class UserRepository {
  public async createUser(email: string, password: string) {
    return prisma.user.create({
      data: {
        email,
        password,
      },
    });
  }

  public async findUserById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    });
  }

  public async findUserQuests(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        questFolders: {
          include: {
            quests: true,
          },
        },
      },
    });
  }

  public async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  public async findUsersByLastReflectionDate(sevenDaysAgo: Date) {
    return await prisma.user.findMany({
      where: {
        lastReflection: {
          lte: sevenDaysAgo,
        },
      },
    });
  }

  public async findUserVerificationToken(
    userId: string,
    code: string,
    type: VerificationTokenType,
    now: Date,
  ) {
    return await prisma.verificationToken.findFirst({
      where: {
        userId,
        code,
        type,
        expiresAt: {
          gte: now,
        },
      },
    });
  }

  public async findLatestToken(
    userId: string,
    type: VerificationTokenType,
    now: Date,
  ) {
    return await prisma.verificationToken.findFirst({
      where: {
        userId,
        type,
        expiresAt: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async updateUserReflectionTime(userId: string, nextReflection: Date, reflectionDays: number) {
    return await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        nextReflection,
        reflectionDays
      },
      select: {
        id: true,
        nextReflection: true,
        reflectionDays: true,
        lastReflection: true
      }
    })
  }

  public async updateUsersLastReflection(
    userIds: string[],
    reflectionDate: Date,
  ) {
    return await prisma.user.updateMany({
      where: {
        id: {
          in: userIds.map((userId) => userId),
        },
      },
      data: {
        lastReflection: reflectionDate,
      },
    });
  }

  public async upsertUser(email: string) {
    return await prisma.user.upsert({
      where: {
        email,
      },
      create: {
        email,
        isVerified: true,
      },
      update: {
        email,
        isVerified: true,
      },
    });
  }

  public async verifyUser(userId: string, nextReflection: Date) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isVerified: true,
        nextReflection
      },
    });
  }

  public async updateUserPassword(id: string, password: string) {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
      omit: {
        password: true,
      },
    });
  }

  public async createToken(
    userId: string,
    code: string,
    expiresAt: Date,
    type: VerificationTokenType,
  ) {
    return await prisma.verificationToken.create({
      data: {
        userId,
        code,
        expiresAt,
        type,
      },
    });
  }

  public async updateUserLevelAndExp(
    userId: string,
    newLevel: number,
    remainingExp: number,
    totalExp: number,
    newExpToNextLevel: number,
  ) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        level: newLevel,
        currentExp: remainingExp,
        totalExp,
        expToNextLevel: newExpToNextLevel,
      },
    });
  }

  public async updateUserLastReflection(userId: string, reflectionDate: Date) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastReflection: reflectionDate,
      },
    });
  }

  public async updateUserPhone(userId: string, phone: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phone,
      },
      omit: {
        password: true,
      },
    });
  }
}
