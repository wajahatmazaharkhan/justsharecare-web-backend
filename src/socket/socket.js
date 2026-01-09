import {
  setIO,
  addOnlineUser,
  getSocketIdByUser,
  removeOnlineUserBySocket,
  getOnlineUsers,
} from "./socketContext.js";

import { User } from "../models/User.models.js";
import { Message } from "../models/message.models.js";
import { decryptText } from "../security/aes-encryption.js";

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

    // Send message event
    socket.on("sendMessage", async (data) => {
      const { conversationId, senderId, receiverId, text, emoji, attachments } =
        data;

      try {
        const receiverSocketId = getSocketIdByUser(receiverId);

        // Fetch the latest message from DB (for decryption)
        const latestMsg = await Message.findOne({
          conversation: conversationId,
          sender: senderId,
        })
          .sort({ createdAt: -1 })
          .lean();

        let decryptedText = text;

        if (latestMsg?.key && latestMsg?.text) {
          try {
            decryptedText = await decryptText(latestMsg.key, latestMsg.text);
          } catch (err) {
            console.error("Decryption failed:", err);
            decryptedText = "[decryption failed]";
          }
        }

        // Emit to receiver
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("getMessage", {
            conversationId,
            senderId,
            text: decryptedText,
            emoji,
            attachments,
            createdAt: new Date(),
          });
        }
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
