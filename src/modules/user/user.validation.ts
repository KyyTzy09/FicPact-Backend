import z from "zod"

export const updateUserReflectionTimeValidation = z.object({
    days: z.number().min(1),
    hours: z.number().min(1)
})