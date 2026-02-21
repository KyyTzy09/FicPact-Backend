import z from "zod";

export const createUserFailedReflectionValidation = z.object({
    reason: z.array(z.string(), { error: "Alasan harus bertype array string" }),
    addOns: z.string().optional()
})