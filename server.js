// ===============================================================
// 📦 Package Imports
// ===============================================================
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";

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
import { Novu } from "@novu/api";
import { trackAnalytics } from "./src/middlewares/trackAnalytics.middlewares.js";
import { analyticsRouter } from "./src/router/Analytics.router.js";
import { errorHandler } from "./src/middlewares/error-handler.js";
import { serviceRouter } from "./src/router/services.router.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";
import csurf from "csurf";
import passport from "./src/config/passport-config.js";

// ===============================================================
// 🚀 Create Express App Instance
// ===============================================================
const app = express();

// ===============================================================
// 🔧 Environment Variables
// ===============================================================
dotenv.config({});
const port = process.env.PORT || 4000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

// ===============================================================
// 🌐 CORS Options (Security + Cross-Origin)
// ===============================================================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests like postman,requestly
    if (!origin) {
      return callback(null, true);
    }

    // Allow only whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block everything else
    return callback(new Error("CORS blocked for origin", origin));
  },
  credentials: true,
  method: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

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
// 🧩 Global Middlewares
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
  res.status(200).json(new ApiResponse(200, null, "Web Server is Running..."));
});

// ===============================================================
//  Razorpay Instance
// ===============================================================

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================================================
// 📌 Register Application Routes
// ===============================================================

// app.use("/razorpay",RazorpayRouter);
app.use("/", userRouter);
app.use("/api/form", FormRouter);
app.use("/api/user", userRouter);
app.use("/api/availability", AvailabilityRouter);
app.use("/api/counsellor", counsellorRouter);
app.use("/api/appointments", AppointmentRouter);
app.use("/analytics", analyticsRouter);
app.use("/api/service", serviceRouter);
// Example: http://localhost:4000/api/form/submit

// Novu Notification Service Instance

export const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY,
});

// ===============================================================
// 🟢 Connect to DB ➜ Start Server
// ===============================================================
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});
