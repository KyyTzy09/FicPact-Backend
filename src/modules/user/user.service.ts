import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "./user.repository.js";

export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    public async getSession(userId: string) {
        const existingUser = this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        return existingUser
    }
}