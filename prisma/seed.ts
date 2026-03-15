import { prisma } from "../src/common/utils/prisma.js";

async function seed() {
    await prisma.achievement.createMany({
        data: [
            {
                id: "achv_001",
                name: "First Step",
                description: "Selesaikan quest pertamamu",
                expReward: 20,
                criteria: "complete_first_quest",
            },
            {
                id: "achv_002",
                name: "Getting Serious",
                description: "Selesaikan 5 quest",
                expReward: 40,
                criteria: "complete_5_quests",
            },
            {
                id: "achv_003",
                name: "Quest Master",
                description: "Selesaikan 10 quest",
                expReward: 80,
                criteria: "complete_10_quests",
            },
            {
                id: "achv_004",
                name: "Unstoppable",
                description: "Selesaikan 50 quest",
                expReward: 200,
                criteria: "complete_50_quests",
            },
            {
                id: "achv_005",
                name: "First Reflection",
                description: "Lakukan refleksi pertama",
                expReward: 25,
                criteria: "first_reflection",
            },
            {
                id: "achv_006",
                name: "Self Awareness",
                description: "Lakukan 5 refleksi",
                expReward: 60,
                criteria: "reflection_5_times",
            },
            {
                id: "achv_007",
                name: "Deep Thinker",
                description: "Lakukan 20 refleksi",
                expReward: 120,
                criteria: "reflection_20_times",
            },
            {
                id: "achv_008",
                name: "Level Up",
                description: "Mencapai level 5",
                expReward: 70,
                criteria: "reach_level_5",
            },
            {
                id: "achv_009",
                name: "Rising Hero",
                description: "Mencapai level 10",
                expReward: 120,
                criteria: "reach_level_10",
            },
            {
                id: "achv_010",
                name: "Legend in Progress",
                description: "Mencapai level 20",
                expReward: 250,
                criteria: "reach_level_20",
            },
            {
                id: "achv_011",
                name: "Organized Mind",
                description: "Buat folder quest pertama",
                expReward: 20,
                criteria: "create_first_folder",
            },
            {
                id: "achv_012",
                name: "Quest Architect",
                description: "Buat 5 folder quest",
                expReward: 80,
                criteria: "create_5_folders",
            },
            {
                id: "achv_013",
                name: "Consistency I",
                description: "Selesaikan quest selama 3 hari berturut-turut",
                expReward: 100,
                criteria: "streak_3_days",
            },
            {
                id: "achv_014",
                name: "Consistency II",
                description: "Selesaikan quest selama 7 hari berturut-turut",
                expReward: 200,
                criteria: "streak_7_days",
            },
            {
                id: "achv_015",
                name: "Consistency Master",
                description: "Selesaikan quest selama 30 hari berturut-turut",
                expReward: 500,
                criteria: "streak_30_days",
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
