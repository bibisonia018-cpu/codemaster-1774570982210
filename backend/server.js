const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend domain
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB (Replace with your URI)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/secret_chat";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join Room Event
  socket.on('join_room', async (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    
    // Fetch last 50 encrypted messages from DB for this room
    try {
      const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(50);
      socket.emit('load_messages', messages);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  });

  // Send Message Event
  socket.on('send_message', async (data) => {
    // data contains: roomId, sender, encryptedText
    // The server NEVER sees the Secret Key or the plain text.
    
    try {
      const newMessage = new Message({
        roomId: data.roomId,
        sender: data.sender,
        encryptedText: data.encryptedText,
      });
      await newMessage.save();

      // Broadcast to everyone in the room (including sender to verify)
      io.to(data.roomId).emit('receive_message', data);
    } catch (err) {
      console.error("Error saving message", err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Secret Chat Server running on port ${PORT}`);
});