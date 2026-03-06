import { hash, verify } from "argon2";
import crypto from "crypto";

export const hashPassword = async (password: string): Promise<string> => {
    return await hash(password);
}

export const verifyPassword = async (
    hashedPassword: string,
    plainPassword: string
): Promise<boolean> => {
    return await verify(hashedPassword, plainPassword);
}

export async function tokenGenerator() {
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = await hashPassword(rawToken)
    return { rawToken, hashedToken }
}