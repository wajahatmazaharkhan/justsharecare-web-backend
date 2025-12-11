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

// ===============================================================
// 🚦 Routes Import
// ===============================================================
import { FormRouter } from "./src/router/Form.router.js";
import { userRouter } from "./src/router/User.router.js";
import { RazorpayRouter } from "./src/router/Razorypay.router.js";
import { AvailabilityRouter } from "./src/router/Availability.router.js"
import { counsellorRouter } from "./src/router/Counsellor.router.js";

// ===============================================================
// 🚀 Create Express App Instance
// ===============================================================
const app = express();

// ===============================================================
// 🔧 Environment Variables
// ===============================================================
dotenv.config({});
const port = process.env.PORT || 4000;

// ===============================================================
// 🌐 CORS Options (Security + Cross-Origin)
// ===============================================================
const corsOptions = {
  origin: "*", // change to specific domain in production
  credentials: true,
  methods: "GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
    "cache-control",
    "svix-id",
    "svix-timestamp",
    "svix-signature",
  ],
  exposedHeaders: ["Authorization"],
};

// ===============================================================
// 🧩 Global Middlewares
// ===============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("/tmp", { index: false }));

// ===============================================================
// 🏠 Default Route
// ===============================================================
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Web server is running healthy!" });
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
app.use("/api/form", FormRouter); 
app.use("/api/user",userRouter);
app.use("/api/availability", AvailabilityRouter);
app.use("/api/counsellor" ,counsellorRouter);


// Example: http://localhost:4000/api/form/submit

// ===============================================================
// 🟢 Connect to DB ➜ Start Server
// ===============================================================
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🔥 Server is running on port: ${port}`);
  });
});
