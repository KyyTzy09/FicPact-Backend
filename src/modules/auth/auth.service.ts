import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";
import { hashPassword, otpGenerator, tokenGenerator, verifyPassword } from "../../common/utils/hash.js";
import { FRONTEND_BASE_URL, JWT_SECRET } from "../../common/utils/env.js";
import { generateToken } from "../../common/utils/jwt.js";
import { sendEmail } from "../../common/utils/email.js";
import { VerificationTokenType } from "@prisma/client";
import { generateWhatsappMessage, sendWhatsApp } from "../../common/utils/fonnte.js";
import { normalizePhone } from "../../common/utils/phone.js";
import { getNextReflectionDate } from "../../common/utils/date.js";
import { generateAvatar } from "../../common/utils/random-avatar.js";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository
  ) {
  }

  public async register(email: string, name: string, password: string) {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) throw new HTTPException(409, { message: "User sudah terdaftar" })
    const hashedPassword = await hashPassword(password);

    const avatar = generateAvatar(email);
    const create = await this.userRepository.createUser(email, name, hashedPassword, avatar);
    if (!create) throw new HTTPException(400, { message: "Gagal membuat user" })

    const payload = { id: create.id, email: create.email };
    const verificationToken = await otpGenerator(6);
    const token = await generateToken(payload, JWT_SECRET);

    await this.userRepository.createToken(create.id, verificationToken, new Date(Date.now() + 1000 * 60 * 15), VerificationTokenType.ACCOUNT)
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
    const name = email.split("@")[0]
    const avatar = generateAvatar(email);

    const user = await this.userRepository.upsertUser(email, name, avatar)
    if (!user) throw new HTTPException(400, { message: "Gagal membuat user" })

    const payload = { id: user.id, email: user.email };
    const token = await generateToken(payload, JWT_SECRET);
    return { token };
  }

  public async forgotPassword(email: string) {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

    const { rawToken, hashedToken } = await tokenGenerator();
    const updatedUserToken = await this.userRepository.createToken(existingUser.id, hashedToken, new Date(Date.now() + 1000 * 60 * 15), VerificationTokenType.PASSWORD) // 15 Minutes(email, hashedToken, new Date(Date.now() + 1000 * 60 * 15)) // 15 Minutes

    const resetLink = `${FRONTEND_BASE_URL}/auth/change-password?token=${rawToken}&email=${email}`
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


    // Cek apakah token ada
    const existingToken = await this.userRepository.findLatestToken(existingUser.id, VerificationTokenType.PASSWORD, new Date())
    if (!existingToken) throw new HTTPException(404, { message: "User tidak ditemukan atau token sudah expired" })

    // Cek apakah token cocok dengan yang di database
    const isTokenMatch = await verifyPassword(existingToken.code || "", token)
    if (!isTokenMatch) throw new HTTPException(400, { message: "Token salah" })

    // Hash password baru dan update ke database
    const hashedPassword = await hashPassword(password);
    const updatedUserPassword = await this.userRepository.updateUserPassword(existingUser.id, hashedPassword)
    return { updatedUserPassword }
  }

  public async verifyAccount(userId: string, token: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    const nextReflectionDate = getNextReflectionDate(7, 0, 0)
    if (!existingUser) throw new HTTPException(404, { message: "User token tidak ditemukan atau sudah kadaluarsa" })

    const existingToken = await this.userRepository.findUserVerificationToken(existingUser.id, token, VerificationTokenType.ACCOUNT, new Date())
    if (!existingToken) throw new HTTPException(404, { message: "User token tidak ditemukan atau sudah kadaluarsa" })

    const isTokenMatched = existingToken.code === token
    if (!isTokenMatched) throw new HTTPException(400, { message: "Token salah" })

    const verifiedUser = await this.userRepository.verifyUser(existingUser.id, nextReflectionDate)
    return { verifiedUser }
  }


  public async resendVerificationToken(userId: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

    const token = await otpGenerator(6);
    const updatedUserToken = await this.userRepository.createToken(existingUser.id, token, new Date(Date.now() + 1000 * 60 * 15), VerificationTokenType.ACCOUNT)

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; color: #333;">
    
    <h2 style="margin-bottom: 10px;">🔐 Verifikasi Akun</h2>
    
    <p style="margin-bottom: 16px;">
      Hampir selesai! Tinggal satu langkah lagi buat aktifin akun kamu di <b>TaskQuest</b>.
    </p>

    <p style="margin-bottom: 8px;">
      Masukkan kode verifikasi berikut:
    </p>

    <div style="
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      background: #f4f4f4;
      padding: 12px;
      text-align: center;
      border-radius: 8px;
      margin: 16px 0;
    ">
      ${token}
    </div>

    <p style="margin-bottom: 16px;">
      Kode ini berlaku selama <b>15 menit</b>. Jangan dibagikan ke siapa pun ya.
    </p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 12px; color: #888;">
      Kalau kamu tidak merasa melakukan ini, abaikan saja email ini.
    </p>

  </div>
`

    await sendEmail({
      to: existingUser.email,
      subject: "Verifikasi Akun",
      html
    })

    return { updatedUserToken }
  }

  private async sendEmailVerificationToken(email: string, token: string) {
    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; color: #333;">
    
    <h2 style="margin-bottom: 10px;">🔐 Verifikasi Akun</h2>
    
    <p style="margin-bottom: 16px;">
      Hampir selesai! Tinggal satu langkah lagi buat aktifin akun kamu di <b>TaskQuest</b>.
    </p>

    <p style="margin-bottom: 8px;">
      Masukkan kode verifikasi berikut:
    </p>

    <div style="
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      background: #f4f4f4;
      padding: 12px;
      text-align: center;
      border-radius: 8px;
      margin: 16px 0;
    ">
      ${token}
    </div>

    <p style="margin-bottom: 16px;">
      Kode ini berlaku selama <b>15 menit</b>. Jangan dibagikan ke siapa pun ya.
    </p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 12px; color: #888;">
      Kalau kamu tidak merasa melakukan ini, abaikan saja email ini.
    </p>

  </div>
`

    await sendEmail({
      to: email,
      subject: "Verifikasi Akun",
      html
    })
  }

  public async updatePhone(userId: string, phone: string, token: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

    const existingToken = await this.userRepository.findLatestToken(existingUser.id, VerificationTokenType.PHONE, new Date())
    if (!existingToken) throw new HTTPException(400, { message: "Token tidak ditemukan" })

    const isTokenMatched = existingToken.code === token
    if (!isTokenMatched) throw new HTTPException(400, { message: "Token salah" })

    const normalizedPhone = normalizePhone(phone)
    const updatedUser = await this.userRepository.updateUserPhone(userId, normalizedPhone)
    return { updatedUser }
  }

  public async resendPhoneVerificationToken(userId: string, phone: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

    const token = await otpGenerator(6);
    const updatedUserToken = await this.userRepository.createToken(existingUser.id, token, new Date(Date.now() + 1000 * 60 * 15), VerificationTokenType.PHONE)

    const normalizedPhone = normalizePhone(phone)
    const message = generateWhatsappMessage("phone_verification", token)

    await sendWhatsApp(normalizedPhone, message)
    return { updatedUserToken }
  }
}
