import { HTTPException } from "hono/http-exception";
import { FONNTE_API_KEY, FONNTE_BASE_URL } from "./env.js";

export async function sendWhatsApp(phone: string, message: string) {
    try {
        const res = await fetch(`${FONNTE_BASE_URL}/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: FONNTE_API_KEY
            },
            body: JSON.stringify({
                target: phone,
                message
            })
        })

        return await res.json()
    } catch (error) {
        throw error
    }
}
