import { sendWhatsApp } from "../../common/utils/fonnte.js";
import type { ReflectionRepository } from "../reflection/reflection.repository.js";
import type { UserRepository } from "../user/user.repository.js";

export class JobService {
    constructor(private readonly userRepository: UserRepository, private readonly reflectionRepository: ReflectionRepository) { }

    public async reflectionTrigger() {
        const now = new Date()
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)
        // Cari semua User dengan LTE last reflection
        const users = await this.userRepository.findUsersByLastReflectionDate(sevenDaysAgo)
        const userIds = users.map((user) => user.id)

        const trigger = await this.reflectionRepository.createManyReflectionTrigger(userIds)
        const updateLastReflection = await this.userRepository.updateUsersLastReflection(userIds, now)

        return { trigger, updateLastReflection }
    }

    public async whatshappNotification() {
        return await sendWhatsApp("6281287601201", "Halo, Testing ini dari backend")
    }
}