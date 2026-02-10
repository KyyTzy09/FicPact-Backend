import { hash, verify } from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
    return await hash(password);
}

export const verifyPassword = async(
    hashedPassword: string,
    plainPassword: string
): Promise<boolean> => {
    return await verify(hashedPassword, plainPassword);
}