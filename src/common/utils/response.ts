import type { Context } from "hono";

export function HttpResponse<T, M>(
    c: Context,
    status: number,
    message: string | null = null,
    data: T,
    meta: M | null = null
){
    return c.json({
        status,
        data,
        message,
        meta
    })
}