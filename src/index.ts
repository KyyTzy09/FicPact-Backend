import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { openAPIRouteHandler } from 'hono-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { HTTPException } from 'hono/http-exception'

// Import Controller Anda
import { userController } from './modules/user/user.controller.js'
import { authController } from './modules/auth/auth.controller.js'
import { folderController } from './modules/folder/folder.controller.js'
import { questController } from './modules/quest/quest.controller.js'
import { reflectionController } from './modules/reflection/reflection.controller.js'

const app = new Hono()

// --- 1. SETUP DOKUMENTASI (OPENAPI & SCALAR) ---

// Endpoint untuk JSON OpenAPI (Ini yang men-generate spec otomatis)
app.get(
  '/openapi.json',
  openAPIRouteHandler(app, {
    documentation: {
      info: { title: 'Quest API', version: '1.0.0' },
      servers: [{ url: 'http://localhost:8080' }],
    },
  })
)

// --- 2. SETUP SCALAR (VERSI FIX ERROR 'spec') ---
app.get(
  '/docs',
  apiReference({
    // JANGAN PAKAI 'spec: { url: ... }'
    // Langsung tulis 'url' di sini sesuai dokumentasi terbaru:
    url: '/openapi.json', 
    theme: 'purple',
    pageTitle: 'Quest API Reference'
  })
)

// --- 2. ROUTES ---

app.get('/', (c) => c.text('Hello Hono!'))

app.route("/user", userController)
app.route("/auth", authController)
app.route("/folder", folderController)
app.route("/quest", questController)
app.route("/reflection", reflectionController)

// --- 3. ERROR HANDLER ---

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

// --- 4. START SERVER ---

const port = 8080
serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`🚀 Server berjalan di http://localhost:${info.port}`)
  console.log(`📖 Dokumentasi (Scalar): http://localhost:${info.port}/docs`)
  console.log(`📄 JSON OpenAPI: http://localhost:${info.port}/openapi.json`)
})