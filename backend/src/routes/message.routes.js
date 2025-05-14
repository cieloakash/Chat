import express from "express"
import { protectRoute } from "../middleware/auth.middleWare.js"
import { getAllMessages, getAllUser,sendMessage } from "../controllers/message.controller.js"

const messageRoute = express.Router()

messageRoute.get('/users',protectRoute,getAllUser)

messageRoute.post("/:id/send",protectRoute,sendMessage)
messageRoute.get('/:id',protectRoute,getAllMessages)

export default messageRoute







