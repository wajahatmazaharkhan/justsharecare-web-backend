// ===============================================================
// 📦 Package Imports
// ===============================================================
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

// ===============================================================
// 🗄️ Database Import
// ===============================================================
import { connectToDatabase } from "./src/db/db.js";

// ===============================================================
// 🚦 Routes Import
// ===============================================================
import { FormRouter } from "./src/router/Form.router.js";
import { userRouter } from "./src/router/User.router.js";

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
  res.status(200).json({ msg: "backend is running" });
});

// ===============================================================
// 📌 Register Application Routes
// ===============================================================
app.use("/api/form", FormRouter); 
app.use("/api/user",userRouter);

// Example: http://localhost:4000/api/form/submit

// ===============================================================
// 🟢 Connect to DB ➜ Start Server
// ===============================================================
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🔥 Server is running on port: ${port}`);
  });
});
