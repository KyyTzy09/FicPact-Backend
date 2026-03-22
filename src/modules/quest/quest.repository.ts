import { prisma } from "../../common/utils/prisma.js";

export class QuestRepository {
  public async findAll(userId: string) {
    return await prisma.quest.findMany({
      where: {
        folder: {
          userId,
        },
      },
      omit: {
        isSuccess: true
      }
    });
  }

  public async countCompletedQuest(userId: string) {
    return await prisma.quest.count({
      where: {
        folder: {
          userId,
        },
        isSuccess: true
      }
    })
  }

  public async countUserReflectedQuest(userId: string) {
    return await prisma.quest.count({
      where: {
        folder: {
          userId,
        },
        reflection: {
          some: {}
        }
      }
    })
  }

  public async countUserCompletedQuest(userId: string) {
    return await prisma.quest.count({
      where: {
        folder: {
          userId,
        },
        isSuccess: true
      }
    })
  }

  public async findByUnique(folderId: string, questName: string) {
    return await prisma.quest.findUnique({
      where: {
        folderId_name: {
          folderId,
          name: questName
        }
      }
    })
  }

  public async findById(questId: string) {
    return await prisma.quest.findUnique({
      where: {
        id: questId,
      },
    });
  }

  public async findFailedQuestsBeforeDate(now: Date, twoHoursAgo: Date) {
    return await prisma.quest.findMany({
      where: {
        deadLineAt: {
          gte: twoHoursAgo, // setelah 2 jam lalu
          lte: now
        },
        isSuccess: false
      },
      include: {
        folder: true
      }
    })
  }

  public async findPendingQuestsBetweenDates(userIds: string[], startDate: Date, endDate: Date) {
    return await prisma.quest.findMany({
      where: {
        folder: {
          userId: {
            in: userIds
          },
        },
        deadLineAt: {
          gte: startDate,
          lte: endDate,
        },
        isSuccess: false,
      },
      include: {
        folder: true
      }
    })
  }

  public async findPendingQuests(userId: string) {
    return await prisma.quest.findMany({
      where: {
        folder: {
          userId,
        },
        isSuccess: false,
      },
    });
  }

  public async updateComplete(questId: string, completedDate: Date) {
    return await prisma.quest.update({
      where: {
        id: questId,
      },
      data: {
        isSuccess: true,
        completedAt: completedDate
      },
    });
  }

  public async updateQuestStatus(questId: string) {
    return await prisma.quest.update({
      where: {
        id: questId
      },
      data: {
        isSuccess: false
      }
    })
  }

  public async createBatchQuest(folderId: string, quests: { name: string; description: string | null; deadLineAt: Date; expReward: number; }[]) {
    return await prisma.quest.createMany({
      data: quests.map((quest) => ({
        folderId,
        name: quest.name,
        description: quest.description,
        expReward: quest.expReward,
        deadLineAt: quest.deadLineAt,
      })),
    });
  }

  public async checkAllQuestInFolder(folderId: string) {
    return await prisma.quest.findMany({
      where: {
        folderId,
        isSuccess: false,
      },
    });
  }

  public async createQuest(folderId: string, title: string, description: string, deadline: string) {
    return await prisma.quest.create({
      data: {
        folderId,
        name: title,
        description,
        deadLineAt: deadline,
      },
    });
  }

  public async deleteQuest(questId: string) {
    return await prisma.quest.delete({
      where: {
        id: questId,
      },
    });
  }

  public async updateQuest(questId: string, title: string, description: string, deadline: Date) {
    return await prisma.quest.update({
      where: {
        id: questId,
      },
      data: {
        name: title,
        description,
        deadLineAt: deadline,
      },
    });
  }
}
