import type { MiddlewareHandler } from "hono"

export const fullLogger: MiddlewareHandler = async (c, next) => {
    const start = Date.now()

    const method = c.req.method
    const path = c.req.path
    const ua = c.req.header("user-agent")

    const ip =
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-real-ip") ||
        c.req.header("x-forwarded-for")?.split(",")[0] ||
        c.env?.ip ||
        "unknown"

    console.log(`\n<-- ${method} ${path}`)
    console.log(`IP: ${ip}`)
    console.log(`Agent: ${ua}`)

    await next()

    const status = c.res.status
    const duration = Date.now() - start

    console.log(`--> ${method} ${path} ${status} ${duration}ms\n`)
}
