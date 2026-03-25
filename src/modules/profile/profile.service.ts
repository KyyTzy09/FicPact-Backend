import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../user/user.repository.js";

export class ProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  public async updateUsername(userId: string, username: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser)
      throw new HTTPException(404, { message: "User tidak ditemukan!" });

    const updatedUsername = await this.userRepository.updateUsername(
      userId,
      username,
    );
    if (!updatedUsername)
      throw new HTTPException(400, {
        message: "Gagal mengupdate username pengguna",
      });

    return updatedUsername;
  }
}
