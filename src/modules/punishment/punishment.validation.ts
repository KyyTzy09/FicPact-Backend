import z from "zod";

export const createPunishmentValidation = z.object({
    questId: z.string().uuid(),
    name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
    deadlineAt: z.string().datetime({ error: "Deadline harus diisi" }),
})

export const updatePunishmentStatusValidation = z.object({
  status: z.boolean(),
  notificationId: z.string().optional(),
})