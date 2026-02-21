import { HTTPException } from "hono/http-exception";
import { reflectionFormatter } from "../../common/utils/reflection.js";
import type { UserRepository } from "../user/user.repository.js";
import type { ReflectionRepository } from "./reflection.repository.js";

export class ReflectionService {
    constructor(
        private readonly reflectionRepository: ReflectionRepository,
        private readonly userRepository: UserRepository
    ) { }

    async CreateUserFailedReflection(userId: string, reason: string[], addOns?: string) {
        const existingUser = await this.userRepository.findUserById(userId)
        if (!existingUser) throw new HTTPException(404, { message: "Pengguna tidak ditemukan" })

        const formatedReflection = reflectionFormatter(reason, addOns)
        const endPeriod = new Date();
        const startPeriod = new Date(endPeriod.getTime() - 7 * 24 * 60 * 60 * 1000);

        const createdReflection = await this.reflectionRepository.createReflection(userId, formatedReflection, startPeriod, endPeriod)
        if (!createdReflection) throw new HTTPException(400, { message: "Gagal membuat refleksi" })

        return createdReflection
    }
}