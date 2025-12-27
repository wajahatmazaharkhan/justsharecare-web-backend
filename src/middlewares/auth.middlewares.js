import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";

const auth = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token)
    return res.status(401).json(new ApiError(401, "No Token Provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(new ApiError(401, "Invalid Token Provided"));
  }
};

export default auth;

// only admin middleware
export const adminVerify = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.authToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized: No Token Provided"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return res
      .status(401)
      .json(new ApiError(401, "Invalid Token || OR || Token Expired"));
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.role !== "admin") {
    return res
      .status(403)
      .json(new ApiError(403, "Access denied: Admins only"));
  }

  req.user = user; // attach full user to request
  next();
});

// only counsellor middleware
export const counsellorVerify = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.authToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized: No token provided"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return res.status(401).json(new ApiError(401, "Invalid or expired token"));
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.role !== "counsellor") {
    return res
      .status(403)
      .json(new ApiError(403, "Access Denied: Counsellors only"));
  }

  req.user = user;
  next();
});
