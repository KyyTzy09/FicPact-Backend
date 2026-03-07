import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import { hashPassword, otpGenerator, tokenGenerator, verifyPassword } from "../../common/utils/hash.js";
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

        const payload = { id: create.id, email: create.email };
        const verificationToken = await otpGenerator(6);
        const token = await generateToken(payload, JWT_SECRET);

        await this.userRepository.updateUserVerificationToken(create.id, verificationToken, new Date(Date.now() + 1000 * 60 * 15))
        await this.sendEmailVerificationToken(email, verificationToken)
        return { token, create };
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
        const updatedUserToken = await this.userRepository.updateResetPassToken(email, hashedToken, new Date(Date.now() + 1000 * 60 * 15)) // 15 Minutes

        const resetLink = `${FRONTEND_BASE_URL}/auth/reset-password?token=${rawToken}&email=${email}`
        const html = `<h2>Reset Password</h2>
    <p>Klik link di bawah untuk reset password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Link berlaku 15 menit.</p>`

        await sendEmail({
            to: email, subject: "Reset Password", html
        })
        return { updatedUserToken }
    }

    public async resetPassword(token: string, password: string, email?: string) {
        // let existingUser;

        // if (email) existingUser = await this.userRepository.findUserByEmail(email);
        // else {
        //     const users = await this.userRepository.findUsersByResetPassTokenExpiry(new Date());
        //     for (const user of users) {
        //         const isPasswordMatch = await verifyPassword(user?.resetPasswordToken || "", token)
        //         if (isPasswordMatch) {
        //             existingUser = user;
        //             break;
        //         }
        //     }
        // }

        // Cek User berdasarkan email
        const existingUser = await this.userRepository.findUserByEmail(email || "")
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        // Cek apakah token sudah expired
        const isTokenExpired = !existingUser?.resetPasswordExpiry || existingUser.resetPasswordExpiry < new Date()
        if (!existingUser || isTokenExpired) throw new HTTPException(404, { message: "User tidak ditemukan atau token sudah expired" })

        // Cek apakah token cocok dengan yang di database
        const isTokenMatch = await verifyPassword(existingUser.resetPasswordToken || "", token)
        if (!isTokenMatch) throw new HTTPException(400, { message: "Token salah" })

        // Hash password baru dan update ke database
        const hashedPassword = await hashPassword(password);
        const updatedUserPassword = await this.userRepository.updateUserPassword(existingUser.id, hashedPassword)
        return { updatedUserPassword }
    }

    public async verifyAccount(userId: string, token: string) {
        const existingUser = await this.userRepository.findUserWithVerifyTokenExpiry(userId, new Date());
        if (!existingUser) throw new HTTPException(404, { message: "User token tidak ditemukan atau sudah kadaluarsa" })

        const isTokenMatched = await existingUser.verificationToken === token
        if (!isTokenMatched) throw new HTTPException(400, { message: "Token salah" })

        const verifiedUser = await this.userRepository.verifyUser(existingUser.id)
        return { verifiedUser }
    }

    public async resendVerificationToken(userId: string) {
        const existingUser = await this.userRepository.findUserById(userId);
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        const token = await otpGenerator(6);
        const updatedUserToken = await this.userRepository.updateUserVerificationToken(existingUser.id, token, new Date(Date.now() + 1000 * 60 * 15))

        const html = `<h2>Verifikasi Akun</h2>
        <p>Masukan token berikut untuk verifikasi akun kamu:</p> 
        <p>${token}</p>
        <p>Token berlaku 15 menit.</p>
        `

        await sendEmail({
            to: existingUser.email,
            subject: "Verifikasi Akun",
            html
        })

        return { updatedUserToken }
    }

    private async sendEmailVerificationToken(email: string, token: string) {
        const html = `<h2>Verifikasi Akun</h2>
        <p>Masukan token berikut untuk verifikasi akun kamu:</p> 
        <p>${token}</p>
        <p>Token berlaku 15 menit.</p>
        `

        await sendEmail({
            to: email,
            subject: "Verifikasi Akun",
            html
        })
    }
}