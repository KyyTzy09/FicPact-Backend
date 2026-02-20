import z from "zod";

export const createFolderValidation = z.object({
    name: z.string().min(3),
    description: z.string().optional()
})

export const updateFolderValidation = z.object({
    name: z.string().min(3),
    description: z.string().optional()
})