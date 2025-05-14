import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import { connectDb } from "./lib/db.js"
import messageRoute from "./routes/message.routes.js"
import cors from "cors"
import {app,server} from './lib/socketio.js'
import path from "path"

// const app =express()


dotenv.config()

const __dirname = path.resolve()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
// base route
app.use("/api/auth",authRoutes)
app.use("/api/messages", messageRoute);
const PORT = process.env.PORT


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
    })
}
server.listen(PORT,()=>{
    // console.log("running on port",PORT);
    connectDb()
    
})