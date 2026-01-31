import {
  setIO,
  addOnlineUser,
  getSocketIdByUser,
  removeOnlineUserBySocket,
  getOnlineUsers,
} from "./socketContext.js";

import { User } from "../models/User.models.js";

// ===============================================================
// 🔗 Socket.IO Logic
// ===============================================================
export const initSocket = (io) => {
  setIO(io);

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // User joins with userId
    socket.on("addUser", async (userId) => {
      addOnlineUser(userId, socket.id);

      // Update lastSeen
      try {
        await User.findByIdAndUpdate(userId, {
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Failed updating lastSeen:", err);
      }

      // Send current online users to this user
      socket.emit("getUsers", getOnlineUsers());

      // Broadcast new user online
      io.emit("userOnline", userId);
    });

    // Join a conversation room
    socket.on("joinRoom", (conversationId) => {
      socket.join(conversationId);
      console.log(`🚪 Socket ${socket.id} joined room: ${conversationId}`);
    });

    // Send message event - UPDATED
    socket.on("sendMessage", async (data) => {
      const { 
        conversationId, 
        senderId, 
        receiverId, 
        text, 
        emoji, 
        attachments,
        createdAt 
      } = data;

      try {
        const receiverSocketId = getSocketIdByUser(receiverId);

        // Text is already DECRYPTED from backend, just forward it
        const messageData = {
          _id: Date.now().toString(),
          conversationId,
          senderId,
          text: text, // Already decrypted
          emoji,
          attachments: attachments || [],
          createdAt: createdAt || new Date().toISOString(),
        };

        // Emit to receiver
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("getMessage", messageData);
          io.to(receiverSocketId).emit("receiveMessage", messageData);
          console.log(`✅ Message delivered to ${receiverId}`);
        } else {
          console.log(`⚠️ Receiver ${receiverId} is offline`);
        }

        // Also broadcast to conversation room
        socket.to(conversationId).emit("receiveMessage", messageData);
      } catch (err) {
        console.error("sendMessage socket error:", err);
      }
    });

    // User disconnects
    socket.on("disconnect", async () => {
      console.log("🔴 User disconnected:", socket.id);

      const disconnectedUser = removeOnlineUserBySocket(socket.id);

      if (disconnectedUser) {
        // Update lastSeen
        try {
          await User.findByIdAndUpdate(disconnectedUser, {
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error("Error updating lastSeen on disconnect:", err);
        }

        // Broadcast offline
        io.emit("userOffline", disconnectedUser);
      }
    });
  });
};
