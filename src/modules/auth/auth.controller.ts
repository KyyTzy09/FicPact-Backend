import { Hono } from "hono";
import { HttpResponse } from "../../common/utils/response.js";

export const authController = new Hono()
    .post(
        "/login",
        async (c) => {
            // Login logic here
            return HttpResponse(c, 200, "Login successful", { token: "dummy-jwt-token" });
        }
    )