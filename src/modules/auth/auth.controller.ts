import { Hono } from "hono";
import { HttpResponse } from "../../common/utils/response.js";
import { sValidator } from "@hono/standard-validator";
import { loginAuthValidation, registerAuthValidation } from "./auth.validation.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "../user/user.repository.js";
import { setCookie } from "hono/cookie";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const authController = new Hono()
    .post(
        "/login",
        sValidator('json', loginAuthValidation),
        async (c) => {
            const { email, password } = c.req.valid("json");
            const result = await authService.login(email, password);
            setCookie(c, "token", result.token, { path: "/", maxAge: 60 * 60 * 24 * 2, httpOnly: true, secure: true, sameSite: "lax" });
            return HttpResponse(c, 200, "Login successful", result);
        }
    )
    .post(
        "/register",
        sValidator('json', registerAuthValidation),
        async (c) => {
            const { email, password } = c.req.valid("json");
            const result = await authService.register(email, password);
            return HttpResponse(c, 200, "Register successful", result);
        }
    );