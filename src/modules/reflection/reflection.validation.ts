import z from "zod";

export const createUserFailedReflectionValidation = z.object({
  reason: z.array(z.string(), { error: "Alasan harus bertype array string" }),
  addOns: z.string().optional(),
});

export const createQuestReflectionValidation = z.object({
  questId: z.string(),
  reasons: z.array(z.string()),
  questStatus: z.boolean(),
  questLevel: z.enum(["HIGH", "NORMAL", "LOW"], {
    error: "Quest level tidak diisi sembarangan",
  }),
});

export const updateReflectionTriggerValidation = z.object({
  reflectionTriggerId: z.uuid(),
  isReflection: z.boolean(),
});
export const createReflectionValidation = z.object({
  notificationId: z.string().uuid(),
});
