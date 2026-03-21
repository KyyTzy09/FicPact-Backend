import { FONNTE_API_KEY, FONNTE_BASE_URL } from "./env.js";

type whatsappTopicType = "reminder_quest" | "quest_failed" | "punishment" | "streak_lost" | "quest_completed" | "phone_verification"

export function generateWhatsappMessage(topic: whatsappTopicType, value: string, url?: string, deadlineAt?: string) {
    switch (topic) {
        case "reminder_quest":
            return `👀 Eh bentar...

Quest kamu *"${value}"* hampir nyentuh deadline.

Jangan ditunda terus, kerjain dikit aja dulu juga gapapa.
Deadline kamu: *${deadlineAt}*

🔗 Lihat detail:
${url}

Gas sekarang sebelum jadi beban 🔥`

        case "quest_failed":
            return `😬 Yah... quest *"${value}"* kelewat.

Santai, bukan akhir dunia. Tapi streak kamu kena 😈

Coba refleksi bentar, kenapa tadi bisa ke-skip?`

        case "punishment":
            return `⚠️ Konsekuensi datang...

Karena quest *"${value}"* gagal, ada "hukuman" yang nunggu kamu.

Jangan kabur ya 😏
Selesaikan, terus lanjut lagi.`

        case "streak_lost":
            return `💔 Waduh...

Streak kamu putus gara-gara *"${value}"*.

Sakit? Iya.
Tapi bisa mulai lagi dari sekarang.`

        case "quest_completed":
            return `🔥 Mantap!

Quest *"${value}"* beres.

Progress kecil gini yang bikin kamu beda dari kemarin.
Keep going 🚀`
        case "phone_verification":
            return `🔐 Verifikasi dulu bentar...

Kode kamu: *${value}*

Jangan share ke siapa-siapa ya.
Masukin kodenya biar bisa lanjut 🚀`

        default:
            return `👋 Ada update dari TaskQuest!

Cek aplikasimu, siapa tau ada yang nunggu kamu 😉`
    }
}

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
