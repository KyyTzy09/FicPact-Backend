import { Hono } from "hono";
import { HttpResponse } from "../../common/utils/response.js";
// Ganti ke validator milik hono-openapi supaya otomatis masuk Docs
import { describeRoute, validator } from "hono-openapi";
import {
    forgotPasswordValidation,
    loginAuthValidation,
    registerAuthValidation,
    resetPasswordValidation,
    verifyAccountValidation,
    updatePhoneValidation,
    resendPhoneVerificationValidation,
} from "./auth.validation.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "../user/user.repository.js";
import { setCookie } from "hono/cookie";
import { googleAuth } from "@hono/oauth-providers/google";
import { FRONTEND_DASHBOARD_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../../common/utils/env.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const authController = new Hono()
    .get(
        "/google",
        describeRoute({
            tags: ["Authentication"],
            summary: "Google Login",
            description: "Login menggunakan akun Google. Email dari Google akan digunakan untuk login atau registrasi otomatis.",
            responses: {
                "302": {
                    description: "Redirect ke dashboard frontend setelah login berhasil"
                }
            }
        }),
        googleAuth({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            scope: ['openid', 'email', 'profile']
        }),
        async (c) => {
            const user = c.get('user-google') as { email: string }
            const result = await authService.loginWithGoogle(user?.email)

            setCookie(c, "token", result.token, {
                path: "/",
                maxAge: 60 * 60 * 24 * 2,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            return c.redirect(FRONTEND_DASHBOARD_URL)
        }
    )
    .post(
        "/login",
        describeRoute({
            tags: ["Authentication"],
            summary: "User Login",
            description: "Login dengan email dan password. Token akan disimpan di cookie.",
            responses: {
                "200": {
                    description: "Login berhasil",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    token: { type: "string", description: "JWT token" },
                                    user: { type: "object", description: "Data user" }
                                }
                            }
                        }
                    }
                }
            }
        }),
        validator("json", loginAuthValidation),
        async (c) => {
            const { email, password } = c.req.valid("json");
            const result = await authService.login(email, password);
            setCookie(c, "token", result.token, {
                path: "/",
                maxAge: 60 * 60 * 24 * 2,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });

            return HttpResponse(c, 200, "Login successful", result);
        },
    )
    .post(
        "/register",
        describeRoute({
            tags: ["Authentication"],
            summary: "User Register",
            description: "Registrasi user baru dengan email dan password. Token akan disimpan di cookie.",
            responses: {
                "201": {
                    description: "Registrasi berhasil",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id: { type: "string", description: "User ID" },
                                    email: { type: "string", description: "Email user" }
                                }
                            }
                        }
                    }
                }
            }
        }),
        validator("json", registerAuthValidation),
        async (c) => {
            const { email, name, password } = c.req.valid("json");
            const result = await authService.register(email, name, password);

            setCookie(c, "token", result.token, {
                path: "/",
                maxAge: 60 * 60 * 24 * 2,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            return HttpResponse(c, 201, "Register successful", result.create);
        }
    )
    .post("/forgot-password",
        describeRoute({
            tags: ["Authentication"],
            summary: "Forgot Password",
            description: "Mengirim email dengan token reset password ke email user.",
            responses: {
                "200": {
                    description: "Email reset password berhasil dikirim"
                }
            }
        }),
        validator("json", forgotPasswordValidation),
        async (c) => {
            const { email } = c.req.valid("json");
            const result = await authService.forgotPassword(email)
            return HttpResponse(c, 200, "Email sent successfully", result.updatedUserToken)
        }
    )
    .post("/reset-password",
        describeRoute({
            tags: ["Authentication"],
            summary: "Reset Password",
            description: "Reset password user menggunakan token yang dikirim via email.",
            responses: {
                "200": {
                    description: "Password berhasil direset"
                }
            }
        }),
        validator("json", resetPasswordValidation),
        async (c) => {
            const { email, password, token } = c.req.valid("json");
            const result = await authService.resetPassword(token, password, email)
            return HttpResponse(c, 200, "Password reset successfully", result.updatedUserPassword)
        }
    )
    .post("/verify-account",
        describeRoute({
            tags: ["Authentication"],
            summary: "Verify Account",
            description: "Verifikasi akun user menggunakan token verifikasi. Memerlukan login.",
            security: [{ bearerAuth: [] }],
            responses: {
                "200": {
                    description: "Akun berhasil diverifikasi"
                }
            }
        }),
        authMiddleware,
        validator("json", verifyAccountValidation),
        async (c) => {
            const userId = c.get("user").id
            const { token } = c.req.valid("json");
            const result = await authService.verifyAccount(userId, token)
            return HttpResponse(c, 200, "Account verified successfully", result.verifiedUser)
        }
    )
    .post("/resend-verification-code",
        describeRoute({
            tags: ["Authentication"],
            summary: "Resend Verification Code",
            description: "Mengirim ulang kode verifikasi ke email user. Memerlukan login.",
            security: [{ bearerAuth: [] }],
            responses: {
                "200": {
                    description: "Kode verifikasi berhasil dikirim ulang"
                }
            }
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("user").id
            const result = await authService.resendVerificationToken(userId)
            return HttpResponse(c, 200, "Verification code sent successfully", result.updatedUserToken)
        }
    )
    .post("/update-phone",
        describeRoute({
            tags: ["Authentication"],
            summary: "Update Phone Number",
            description: "Memperbarui nomor WhatsApp/HP user. Format: 0812xxxx atau +6282xxxx. Memerlukan login.",
            security: [{ bearerAuth: [] }],
            responses: {
                "200": {
                    description: "Nomor telepon berhasil diperbarui",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id: { type: "string", description: "User ID" },
                                    phone: { type: "string", description: "Nomor telepon yang baru" }
                                }
                            }
                        }
                    }
                }
            }
        }),
        authMiddleware,
        validator("json", updatePhoneValidation),
        async (c) => {
            const userId = c.get("user").id
            const { phone, token } = c.req.valid("json");
            const result = await authService.updatePhone(userId, phone, token)
            return HttpResponse(c, 200, "Phone number updated successfully", result.updatedUser)
        }
    )
    .post("/resend-phone-verification",
        describeRoute({
            tags: ["Authentication"],
            summary: "Phone Verification",
            description: "Membuat kode verifikasi nomor WhatsApp/HP user. Format: 0812xxxx atau +6282xxxx. Memerlukan login.",
            security: [{ bearerAuth: [] }],
            responses: {
                "200": {
                    description: "Kode verifikasi berhasil dikirimkan",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    token: { type: "string", description: "Kode verifikasi" }
                                }
                            }
                        }
                    }
                }
            }
        }),
        authMiddleware,
        validator("json", resendPhoneVerificationValidation),
        async (c) => {
            const userId = c.get("user").id
            const { phone } = c.req.valid("json");
            const result = await authService.resendPhoneVerificationToken(userId, phone)
            return HttpResponse(c, 200, "Verification code sent successfully", result.updatedUserToken)
        }
    )
    .delete(
        "/logout",
        describeRoute({
            tags: ["Authentication"],
            summary: "Logout",
            description: "Logout user. Memerlukan login.",
            security: [{ bearerAuth: [] }],
            responses: {
                "200": {
                    description: "Logout berhasil",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", description: "Logout berhasil" }
                                }
                            }
                        }
                    }
                }
            }
        }),
        authMiddleware,
        async (c) => {
            setCookie(c, "token", "", {
                path: "/",
                maxAge: -1,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
            return HttpResponse(c, 200, "Logout berhasil", { message: "Logout berhasil" })
        }
    )
