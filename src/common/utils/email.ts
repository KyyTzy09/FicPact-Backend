import nodemailer from "nodemailer"
import { EMAIL_ADMIN, EMAIL_PASS } from "./env.js"

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_ADMIN,
            pass: EMAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: `"TaskQuest Support" <${EMAIL_ADMIN}>`,
        to,
        subject,
        html,
    })
}