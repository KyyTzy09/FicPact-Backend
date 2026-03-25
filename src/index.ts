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
import { achievementController } from './modules/achievement/achievement.controller.js'
import { leaderboardController } from './modules/leaderboards/leaderboard.controller.js'
import { punishmentController } from './modules/punishment/punishment.controller.js'
import { jobController } from './modules/job/job.controller.js'
import { notificationController } from './modules/notification/notification.controller.js'
import { profileController } from './modules/profile/profile.controller.js'

const app = new Hono().basePath('/api')
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
        origin: (origin) => {
            const allowedOrigins = [
                "http://localhost:3000",
                "https://taskquestku.online"
            ];
            // Jika origin kosong (same-site) atau ada di daftar putih, ijinkan
            if (!origin || allowedOrigins.includes(origin)) {
                return origin;
            }
            return "https://taskquestku.online";
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
    })
)

app.get('/', (c) => c.text('Hello Hono!'))
app.get('/test', (c) => c.text('Hello Hono!'))
app.get('/health', (c) => c.json({ status: 'OK' }))


app.route("/user", userController)
app.route("/profile", profileController)
app.route("/auth", authController)
app.route("/folders", folderController)
app.route("/quests", questController)
app.route("/reflection", reflectionController)
app.route("ai", aiController)
app.route("/achievements", achievementController)
app.route("/leaderboards", leaderboardController)
app.route("/punishments", punishmentController)
app.route("/jobs", jobController)
app.route("/notifications", notificationController)

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
