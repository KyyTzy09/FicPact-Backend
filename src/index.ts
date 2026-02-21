import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { userController } from './modules/user/user.controller.js'
import { authController } from './modules/auth/auth.controller.js'
import { HTTPException } from 'hono/http-exception'
import { folderController } from './modules/folder/folder.controller.js'
import { questController } from './modules/quest/quest.controller.js'
import { reflectionController } from './modules/reflection/reflection.controller.js'

const app = new Hono()
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/user", userController)
app.route("/auth", authController)
app.route("/folder", folderController)
app.route("/quest", questController)
app.route("/reflection", reflectionController)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ success: false, status: err.status, message: err.message }, { status: err.status })
  }

  return c.json({ success: false, status: 500, message: err.message }, { status: 500 });
})

serve({
  fetch: app.fetch,
  port: 8080
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
