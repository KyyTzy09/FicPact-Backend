
export function reflectionFormatter(reason: string[], addOns?: string) {
    const result = `Saya mengalami kegagalan dalam menyelesaikan quest quest yang saya buat dikarenakan:
        ${reason.map((v) => {
        return `- ${v}`
    }).join("\n")}
    Tambahan: ${addOns}`

    return result
}