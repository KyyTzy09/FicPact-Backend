import { prisma } from "../../shared/utils/prisma.js";

export class UserRepository {
    public async createUser(email: string, password: string){
        return prisma.user.create({
            data: {
                email,
                password
            }
        })
    }

    public async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email
            }
        })
    }
}