import z from "zod";

export const registerAuthValidation = z.object({
  email: z.email(),
  password: z
    .string({ message: "Password wajib di isi" })
    .min(6, { message: "Minimal 6 karakter" }),
});

export const loginAuthValidation = z.object({
  email: z.email(),
  password: z
    .string({ message: "Password wajib di isi" })
    .min(6, { message: "Minimal 6 karakter" }),
});

export const forgotPasswordValidation = z.object({
  email: z.email(),
})

export const resetPasswordValidation = z.object({
  email: z.email().optional(),
  token: z.string(),
  password: z
    .string({ message: "Password wajib di isi" })
    .min(6, { message: "Minimal 6 karakter" }),
})

export const verifyAccountValidation = z.object({
  token: z.string(),
})

export const updatePhoneValidation = z.object({
  phone: z
    .string({ message: "Nomor telepon wajib di isi" })
    .regex(/^(\+62|0)[0-9]{9,12}$/, { message: "Nomor telepon tidak valid. Format: 0812xxxx atau +6282xxxx" }),
  token: z.string().max(6, { message: "Token maksimal 6 karakter" }),
})