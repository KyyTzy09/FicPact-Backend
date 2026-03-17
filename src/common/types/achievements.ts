export type AchievementCriteria = {
    type: "quest" | "reflection" | "level" | "folder" | "streak"
    condition: "complete" | "create" | "reach"
    target: number
}