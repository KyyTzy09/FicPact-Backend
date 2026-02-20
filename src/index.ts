import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { userController } from './modules/user/user.controller.js'
import { authController } from './modules/auth/auth.controller.js'
import { HTTPException } from 'hono/http-exception'
import { folderController } from './modules/folder/folder.controller.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/user", userController)
app.route("/auth", authController)
app.route("/folder", folderController)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ success: false, message: err.message }, { status: err.status })
  }

  return c.json({ success: false, message: err.message }, { status: 500 });
})


serve({
  fetch: app.fetch,
  port: 8080
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
