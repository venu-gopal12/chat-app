import express from 'express';
import cors from 'cors';
import "dotenv/config";
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";




const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*"
    
  }
});

//store online users
export const userSocketMap = {};// {userId:socketId}
//socket connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('New client connected', socket.id);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }


  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on('disconnect', () => {
    console.log('User disconnected', userId);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });


});

const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));


app.use('/api/status', (req, res) => {
  res.send('Server is running');
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect to DB
await connectDB();

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});