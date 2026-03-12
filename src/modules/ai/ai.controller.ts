import { Hono } from "hono";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

export const aiController = new Hono()
    .post(
        "command",
        authMiddleware,
        async (c) => {
            const { text } = await c.req.json()
            
            
            // {
            //   "action": "create_folder_with_quests",
            //   "folder": {
            //     "name": "Ulangan Minggu Ini",
            //     "description": "Persiapan ulangan"
            //   },
            //   "quests": [
            //     {
            //       "name": "Belajar Matematika",
            //       "deadline": "2026-03-20"
            //     },
            //     {
            //       "name": "Belajar Fisika",
            //       "deadline": "2026-03-20"
            //     }
            //   ]
            // }
        }
    )
