import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectDb } from "./lib/db.js";
import messageRoute from "./routes/message.routes.js";
import cors from "cors";
import { app, server } from "./lib/socketio.js";
import path from "path";

// const app =express()

const PORT = process.env.PORT;
dotenv.config();

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({extended:true}))

if(process.env.NODE_ENV === "production"){
    const staticPath = path.join(__dirname, "../../frontend/dist");
    
    // Serve static files
    app.use(express.static(staticPath));
    app.get("/*all", (req, res) => {
        res.sendFile(path.join(staticPath, "index.html"));
      });
      
}


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoute);
server.listen(PORT, () => {
  connectDb();
});
