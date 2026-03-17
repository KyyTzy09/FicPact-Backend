export type AchievementCriteria = {
    type: AchievementType
    condition: AchievementCondition
    target: number
}

export type AchievementType = "quest" | "reflection" | "level" | "folder" | "streak"
export type AchievementCondition = "complete" | "create" | "reach"