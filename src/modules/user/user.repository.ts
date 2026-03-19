import type { User, VerificationTokenType } from "@prisma/client";
import { prisma } from "../../common/utils/prisma.js";
import type { ExpLogSourceType } from "../../common/types/explog.js";

export class UserRepository {
  public async createUser(email: string, name: string, password: string, avatar: string) {
    return prisma.user.create({
      data: {
        email,
        password,
        profile: {
          create: {
            name,
            avatar
          }
        }
      },
    });
  }

  public async findAllUsers() {
    return await prisma.user.findMany({
      include: {
        profile: true,
      },
      omit: {
        password: true
      }
    });
  }

  public async findUserById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
      omit: {
        password: true
      }
    });
  }

  public async findUserWithProfileById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    });
  }

  public async findUsersByNextReflectionDate(startDate: Date, endDate: Date) {
    return await prisma.user.findMany({
      where: {
        nextReflection: {
          gte: startDate,
          lte: endDate,
        }
      }
    })
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

  public async upsertUser(email: string, name: string, avatar: string) {
    return await prisma.user.upsert({
      where: {
        email,
      },
      create: {
        email,
        isVerified: true,
        profile: {
          create: {
            name,
            avatar
          }
        }
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

  public async getAllExpLogs(startDate: Date, endDate: Date) {
    return await prisma.expLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  }

  public async updateLevelAndLog(
    userId: string,
    user: {
      newLevel: number,
      remainingExp: number,
      totalExp: number,
      newExpToNextLevel: number,
    },
    expGained: number,
    source: ExpLogSourceType,
  ) {
    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          level: user.newLevel,
          currentExp: user.remainingExp,
          totalExp: user.totalExp,
          expToNextLevel: user.newExpToNextLevel,
        },
      });

      await tx.expLog.create({
        data: {
          userId,
          amount: expGained,
          source
        }
      })

      return updatedUser;
    });
  }
}
