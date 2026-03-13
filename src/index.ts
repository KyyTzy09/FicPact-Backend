import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { openAPIRouteHandler } from 'hono-openapi'
import { HTTPException } from 'hono/http-exception'

// Import Controller Anda
import { userController } from './modules/user/user.controller.js'
import { authController } from './modules/auth/auth.controller.js'
import { folderController } from './modules/folder/folder.controller.js'
import { questController } from './modules/quest/quest.controller.js'
import { reflectionController } from './modules/reflection/reflection.controller.js'
import { cors } from 'hono/cors'
import { aiController } from './modules/ai/ai.controller.js'
import { fullLogger } from './common/middlewares/logger.middleware.js'
import { apiReference } from '@scalar/hono-api-reference'

const app = new Hono()
app.use("*", fullLogger)


app.get(
    '/openapi.json',
    openAPIRouteHandler(app, {
        documentation: {
            info: { title: 'Quest API', version: '1.0.0' },
            servers: [{ url: 'http://localhost:8080' }],
        },
    })
)

app.get(
    '/docs',
    apiReference({
        url: '/openapi.json',
        theme: 'purple',
        pageTitle: 'Quest API Reference'
    })
)


app.use(
    "*",
    cors({
        origin: ["http://localhost:3000"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
)

app.get('/', (c) => c.text('Hello Hono!'))
app.get('/test', (c) => c.text('Hello Hono!'))
app.get('/health', (c) => c.json({ status: 'OK' }))


app.route("/user", userController)
app.route("/auth", authController)
app.route("/folders", folderController)
app.route("/quests", questController)
app.route("/reflection", reflectionController)
app.route("ai", aiController)


app.onError((err, c) => {
    if (err instanceof HTTPException) {
        return c.json(
            { success: false, status: err.status, message: err.message },
            { status: err.status }
        )
    }

    // Handle error 500
    return c.json(
        { success: false, status: 500, message: err.message || "Internal Server Error" },
        { status: 500 }
    )
})


const port = 8080
serve({
    fetch: app.fetch,
    port: port
}, (info) => {
    console.log(`🚀 Server berjalan di http://localhost:${info.port}`)
    console.log(`📖 Dokumentasi (Scalar): http://localhost:${info.port}/docs`)
    console.log(`📄 JSON OpenAPI: http://localhost:${info.port}/openapi.json`)
})
