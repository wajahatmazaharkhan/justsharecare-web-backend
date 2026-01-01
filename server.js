// ===============================================================
// 📦 Package Imports
// ===============================================================
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import { createServer } from "http";
import { Server } from "socket.io";

// ===============================================================
// 🗄️ Database Import
// ===============================================================
import { connectToDatabase } from "./src/db/db.js";
import { limiter } from "./src/middlewares/rate-limiter.js";
import { sessionConfig } from "./src/config/session.js";
import { cacheControl } from "./src/middlewares/cache-control.js";

// ===============================================================
// 🚦 Routes Import
// ===============================================================
import { FormRouter } from "./src/router/Form.router.js";
import { userRouter } from "./src/router/User.router.js";
import { RazorpayRouter } from "./src/router/Razorypay.router.js";
import { AvailabilityRouter } from "./src/router/Availability.router.js";
import { counsellorRouter } from "./src/router/Counsellor.router.js";
import { AppointmentRouter } from "./src/router/Appointments.router.js";
import { chatRouter } from "./src/router/chat.router.js";
import { messageRouter } from "./src/router/message.router.js";
import { analyticsRouter } from "./src/router/Analytics.router.js";
import { serviceRouter } from "./src/router/services.router.js";

// ===============================================================
// 🧠 Other Imports
// ===============================================================
import { Novu } from "@novu/api";
import { trackAnalytics } from "./src/middlewares/trackAnalytics.middlewares.js";
import { errorHandler } from "./src/middlewares/error-handler.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";
import passport from "./src/config/passport-config.js";

// ===============================================================
// Models & Security
// ===============================================================
import { Message } from "./src/models/message.models.js";
import { decryptText } from "./src/security/aes-encryption.js";
import { User } from "./src/models/User.models.js";

// ===============================================================
// 🔧 Environment Variables
// ===============================================================
dotenv.config();
const port = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

// ===============================================================
// 🌐 Express App & HTTP Server
// ===============================================================
const app = express();
const server = createServer(app);

// ===============================================================
// ⚡ Socket.IO
// ===============================================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST"],
  },
});

// ===============================================================
// 🌐 CORS Options
// ===============================================================
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked for origin: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "cache-control",
    "svix-id",
    "svix-timestamp",
    "svix-signature",
  ],
};

// ===============================================================
// 🧩 Middlewares
// ===============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("/tmp", { index: false }));
app.use(errorHandler);
app.use(trackAnalytics);
app.use(limiter);
// app.use(csurf({ cookie: true }));
app.set("trust proxy", 1);
app.use(sessionConfig);
app.use(cacheControl);
app.use(passport.initialize());
app.use(passport.session());

// ===============================================================
// 🏠 Default Route
// ===============================================================
app.get("/", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, null, "Web Server is Running..."));
});

// ===============================================================
//  Razorpay Instance
// ===============================================================
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================================================
//  Novu Instance
// ===============================================================
export const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY,
});

// ===============================================================
// 📌 Register Routes
// ===============================================================
app.use("/", userRouter);
app.use("/api/form", FormRouter);
app.use("/api/user", userRouter);
app.use("/api/availability", AvailabilityRouter);
app.use("/api/counsellor", counsellorRouter);
app.use("/api/appointments", AppointmentRouter);
app.use("/analytics", analyticsRouter);
app.use("/api/service", serviceRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// ===============================================================
// 🔗 Socket.IO Logic
// ===============================================================
let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // User joins with userId
  socket.on("addUser", async (userId) => {
    onlineUsers.set(userId, socket.id);

    // Update lastSeen
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    } catch (err) {
      console.error("Failed updating lastSeen:", err);
    }

    // Send current online users to this user
    socket.emit("getUsers", Array.from(onlineUsers.keys()));

    // Broadcast new user online
    io.emit("userOnline", userId);
  });

  // Send message event
  socket.on("sendMessage", async (data) => {
    const {
      conversationId,
      senderId,
      receiverId,
      text,
      emoji,
      attachments,
    } = data;

    try {
      const receiverSocketId = onlineUsers.get(receiverId);

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
    let disconnectedUser = null;

    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUser) {
      // Update lastSeen
      try {
        await User.findByIdAndUpdate(disconnectedUser, { lastSeen: new Date() });
      } catch (err) {
        console.error("Error updating lastSeen on disconnect:", err);
      }

      // Broadcast offline
      io.emit("userOffline", disconnectedUser);
    }
  });
});

// ===============================================================
// 🟢 Connect to DB & Start Server
// ===============================================================
connectToDatabase().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});
