import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import { hashPassword, tokenGenerator, verifyPassword } from "../../common/utils/hash.js";
import { FRONTEND_BASE_URL, JWT_SECRET } from "../../common/utils/env.js";
import { generateToken } from "../../common/utils/jwt.js";
import { sendEmail } from "../../common/utils/email.js";

export class AuthService {
    constructor(
        private readonly userRepository: UserRepository
    ) {
    }

    public async register(email: string, password: string) {
        const existingUser = await this.userRepository.findUserByEmail(email);
        if (existingUser) throw new HTTPException(409, { message: "User sudah terdaftar" })
        const hashedPassword = await hashPassword(password);
        const create = await this.userRepository.createUser(email, hashedPassword);
        if (!create) throw new HTTPException(400, { message: "Gagal membuat user" })
        return create;
    }

    public async login(email: string, password: string) {
        const user = await this.userRepository.findUserByEmail(email)
        if (!user) throw new HTTPException(404, { message: "User tidak di temukan" })
        const isPasswordMatch = await verifyPassword(user?.password || "", password)
        if (!isPasswordMatch) throw new HTTPException(401, { message: "Password salah" })
        const payload = { id: user.id, email: user.email };
        const token = await generateToken(payload, JWT_SECRET);
        return { token };
    }

    public async loginWithGoogle(email: string) {
        const user = await this.userRepository.upsertUser(email)
        if (!user) throw new HTTPException(400, { message: "Gagal membuat user" })

        const payload = { id: user.id, email: user.email };
        const token = await generateToken(payload, JWT_SECRET);
        return { token };
    }

    public async forgotPassword(email: string) {
        const existingUser = await this.userRepository.findUserByEmail(email);
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        const { rawToken, hashedToken } = await tokenGenerator();
        const updatedUserToken = ""

        const resetLink = `${FRONTEND_BASE_URL}/auth/reset-password?token=${rawToken}`
        const html = `<h2>Reset Password</h2>
    <p>Klik link di bawah untuk reset password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Link berlaku 15 menit.</p>`

        await sendEmail({
            to: email, subject: "Reset Password", html
        })
        return { updatedUserToken }
    }
}