require("dotenv").config();
const express = require('express');
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const Router = require("./Router/router");
const ConnectDB = require("./DB/db");
const Message = require("./ModeL/Message");

app.use(express.json());
app.use('/', Router);

// 🔥 http server create
const server = http.createServer(app);

// 🔥 socket setup
const io = new Server(server, {
  cors: { origin: "*" }
});

// 👉 userId : socketId
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ join
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log("User joined:", userId);
  });

  // ✅ send message
  socket.on("send_message", async (data) => {
    const { sender, receiver, text } = data;

    // DB save
    const newMsg = await Message.create({
      sender,
      receiver,
      text
    });

    // receiver ko bhejo
    const receiverSocket = users[receiver];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", newMsg);
    }

    // sender ko bhi bhejo
    socket.emit("receive_message", newMsg);
  });

  // ❌ disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ❗ IMPORTANT: app.listen ki jagah server.listen
const port = process.env.PORT || 4040;

ConnectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});