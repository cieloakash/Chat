import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import { connectDb } from "./lib/db.js"
import messageRoute from "./routes/message.routes.js"
import cors from "cors"
import {app,server} from './lib/socketio.js'

// const app =express()


dotenv.config()
app.use(cors({
    origin:process.env.FRONTEND_CORS,
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

// base route
app.use("/api/auth",authRoutes)
app.use("/api/messages", messageRoute);
const PORT = process.env.PORT

server.listen(PORT,()=>{
    // console.log("running on port",PORT);
    connectDb()
    
})