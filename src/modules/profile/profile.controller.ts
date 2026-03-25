import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { ProfileService } from "./profile.service.js";
import { UserRepository } from "../user/user.repository.js";
import { updateUsernameValidation } from "./profile.validation.js";
import { HttpResponse } from "../../common/utils/response.js";

const userRepository = new UserRepository();
const profileService = new ProfileService(userRepository);

export const profileController = new Hono().put(
  "/update-name",
  describeRoute({
    tags: ["Profile"],
    summary: "Update Username",
    security: [{ bearerAuth: [] }],
  }),
  authMiddleware,
  validator("json", updateUsernameValidation),
  async (c) => {
    const userId = c.get("user").id;
    const { username } = c.req.valid("json");
    const result = await profileService.updateUsername(userId, username);

    return HttpResponse(c, 200, "Username updated successfully", result);
  },
);
