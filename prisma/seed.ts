import { prisma } from "../src/common/utils/prisma.js";

async function seed() {
    await prisma.achievement.createMany({
        data: [
            {
                id: "achv_001",
                name: "First Quest Completed",
                description: "Selesaikan quest pertamamu",
                expReward: 20,
                criteria: "complete_first_quest",
            },
            {
                id: "achv_002",
                name: "Level 5 Achiever",
                description: "Naik ke level 5",
                expReward: 50,
                criteria: "reach_level_5",
            },
            {
                id: "achv_003",
                name: "Quest Master",
                description: "Selesaikan 10 quest",
                expReward: 100,
                criteria: "complete_10_quests",
            },
        ],
        skipDuplicates: true,
    })
}

seed()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
