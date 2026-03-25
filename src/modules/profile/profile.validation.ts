import z from "zod";

export const updateUsernameValidation = z.object({
  username: z.string().min(3),
});
