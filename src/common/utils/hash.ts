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

export async function otpGenerator(length:  number = 6): Promise<string> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""

    for (let i = 0; i < length; i++) {
        const index = crypto.randomInt(0, chars.length)
        result += chars[index]
    }

    return result
}