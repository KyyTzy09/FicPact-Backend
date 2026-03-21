import z from "zod";

export const UpdateQuestValidation = z.object({
  questId: z.string().uuid(),
  title: z.string().min(2, "Title terlalu pendek").max(100).optional(),
  description: z.string().max(500).optional(),
  deadline: z.string().datetime()
});

export const CreateQuestValidation = z.object({
  folderId: z.string().uuid(),
  title: z.string().min(2, "Title terlalu pendek").max(100),
  description: z.string().max(500).optional(),
  deadline: z.string().datetime()
});

export const CreateQuestWithVoiceValidation = z.object({
  text: z.string().min(3),
  mode: z.enum(["with-folder", "task-only"])
});
