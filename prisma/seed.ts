import { prisma } from "../src/common/utils/prisma.js";

async function seed() {
    await prisma.achievement.createMany({
        data: [
            {
                id: "achv_001",
                name: "First Quest Completed",
                description: "Selesaikan quest pertamamu",
                expReward: 20,
                criteria: "Complete first quest",
            },
            {
                id: "achv_002",
                name: "Level 5 Achiever",
                description: "Naik ke level 5",
                expReward: 50,
                criteria: "Reach level 5",
            },
            {
                id: "achv_003",
                name: "Quest Master",
                description: "Selesaikan 10 quest",
                expReward: 100,
                criteria: "Complete 10 quests",
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
