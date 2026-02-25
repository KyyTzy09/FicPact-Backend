import { Hono } from "hono";
import { ReflectionRepository } from "../reflection/reflection.repository.js";
import { UserRepository } from "../user/user.repository.js";

const userRepository = new UserRepository()
const reflectionRepository = new ReflectionRepository()

export const jobController = new Hono()
    .post(
        "/reflection-trigger",
        async (c) => {
            // Cari semua User dengan LTE last reflection
            // Loop user dari data query
            // generate reflection trigger untuk user tersebut
            // kirim wa(OPTIONAL) 
        }
    )
    .post(
        "/whatsapp-notification",
        async (c) => {
            // 
        }
    )