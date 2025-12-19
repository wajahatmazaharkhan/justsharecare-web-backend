import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export default auth;

// only admin middleware
export const adminVerify = async (req, res, next) => {
  try {
    const token =
      req.cookies.authToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.user = user; // attach full user to request
    next();
  } catch (error) {
    console.error("AdminVerify Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// only counsellor middleware
export const counsellorVerify = async (req, res, next) => {
  try {
    const token =
      req.cookies.authToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "counsellor") {
      return res
        .status(403)
        .json({ message: "Access denied: Counsellors only" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("CounsellorVerify Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
