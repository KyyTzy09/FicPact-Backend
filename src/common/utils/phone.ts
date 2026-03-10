export function normalizePhone(phone: string) {
    if (phone.startsWith("+")) {
        phone = phone.slice(1)
    }

    if (phone.startsWith("0")) {
        phone = "62" + phone.slice(1)
    }

    return phone
}