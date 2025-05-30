import {Server} from "socket.io"
import express from 'express'
import http from "http"


const app = express();
const server = http.createServer(app)

// socket io server
const io = new Server(server,{
    cors:{
        origin:[process.env.FRONTEND_CORS],
    }
})

// return socketId from userSocketMap object when receiving userId  
export function getReceiverSocketId(userId){
    return userSocketMap[userId]
}
// online user
const userSocketMap = {} //{userId:socketId}
io.on("connection",(socket)=>{
    // console.log("user connected",socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

     // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        // console.log("disconnected",socket);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        
    })
})

export {io,app,server}