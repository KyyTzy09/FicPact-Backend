import { Hono } from "hono";
import { HttpResponse } from "../../common/utils/response.js";
// Ganti ke validator milik hono-openapi supaya otomatis masuk Docs
import { describeRoute, validator } from "hono-openapi";
import {
    loginAuthValidation,
    registerAuthValidation,
    resetPasswordValidation,
} from "./auth.validation.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "../user/user.repository.js";
import { setCookie } from "hono/cookie";
import { googleAuth } from "@hono/oauth-providers/google";
import { FRONTEND_DASHBOARD_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../../common/utils/env.js";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const authController = new Hono()
    .post(
        "/login",
        describeRoute({
            tags: ["Authentication"],
            summary: "User Login",
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
                sameSite: "lax",
            });

            return HttpResponse(c, 200, "Login successful", result);
        },
    )
    .post(
        "/register",
        describeRoute({
            tags: ["Authentication"],
            summary: "User Register",
        }),
        validator("json", registerAuthValidation),
        async (c) => {
            const { email, password } = c.req.valid("json");
            const result = await authService.register(email, password);

            return HttpResponse(c, 201, "Register successful", result);
        }
    )
    .post("/forgot-password",
        validator("json", registerAuthValidation),
        async (c) => {
            const { email } = c.req.valid("json");
            const result = await authService.forgotPassword(email)
            return HttpResponse(c, 200, "Email sent successfully", result)
        }
    )
    .post("/reset-password",
        validator("json", resetPasswordValidation),
        async (c) => {
            const { email, password, token } = c.req.valid("json");
            const result = await authService.resetPassword(token, password, email)
            return HttpResponse(c, 200, "Password reset successfully", result)
        }
    )
    .get(
        "/google",
        describeRoute({
            tags: ["Authentication"],
            summary: "Google Login",
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
                sameSite: "lax",
            });
            return c.redirect(FRONTEND_DASHBOARD_URL)
        }
    )