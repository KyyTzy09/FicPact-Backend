import z from "zod";

export const UpdateQuestValidation = z.object({
    questId: z.string().uuid(),
    title: z.string().min(3, "Title terlalu pendek").max(100).optional(),
    description: z.string().min(5).max(500).optional(),
    deadline: z.coerce.date(),
});

export const CreateQuestValidation = z.object({
    folderId: z.string().uuid(),
    title: z.string().min(3, "Title terlalu pendek").max(100),
    description: z.string().min(5).max(500),
    deadline: z.coerce.date(),
});
