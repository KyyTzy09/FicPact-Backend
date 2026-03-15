import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "./user.repository.js";
import { getNextReflectionDate, updateReflectionTime } from "../../common/utils/date.js";

export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    public async getSession(userId: string) {
        const existingUser = this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        return existingUser
    }

    public async updateReflectionTime(userId: string, days: number, hours: number) {
        const existingUser = await this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "User tidak ditemukan" })

        const nextReflectionDate =
            existingUser.reflectionDays === days ?
                updateReflectionTime(existingUser.nextReflection!, existingUser.reflectionDays, hours) :
                getNextReflectionDate(days, hours)

        const updatedUser = await this.userRepository.updateUserReflectionTime(userId, nextReflectionDate, days)
        if (!updatedUser) throw new HTTPException(500, { message: "Gagal mengubah waktu refleksi" })

        return updatedUser
    }
}