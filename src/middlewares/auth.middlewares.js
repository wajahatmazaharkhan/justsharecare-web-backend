import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const auth = async (req, res, next) => {
  const authHeaders = req.header("Authorization");

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(401).json(new ApiError(401, "No token"));
  }
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return res.status(401).json(new ApiError(401, "No Token Provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(new ApiError(401, "Invalid Token Provided"));
  }
};

export default auth;

export const googleJwtMiddleware = (req, res, next) => {
  const tokenHeaders = req.header("Authorization");

  if (!tokenHeaders || !tokenHeaders.startsWith("Bearer ")) {
    return res.status(401).json(new ApiError(401, "No token "));
  }
  const accessToken = tokenHeaders.split(" ")[1];
  const refreshToken = tokenHeaders.split(" ")[1];

  try {
    const publicKey = fs.readFileSync(
      path.join(__dirname, "../public.key"),
      "utf8"
    );

    if (accessToken && refreshToken) {
      jwt.verify(
        accessToken,
        publicKey,
        { algorithms: ["RS256"] },
        (err, decoded) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              // The access token is expired. Try to refresh it.
              jwt.verify(
                refreshToken,
                publicKey,
                { algorithms: ["RS256"] },
                (err, decoded) => {
                  if (err) {
                    // The refresh token is also invalid or expired. The user needs to log in again.
                    res.status(401).send("Unauthorized: Invalid token");
                  } else {
                    // The refresh token is valid. Generate a new access token and continue.
                    const privateKey = fs.readFileSync(
                      path.join(__dirname, "../private.key"),
                      "utf8"
                    );
                    const newAccessToken = jwt.sign(
                      { userId: decoded.userId },
                      privateKey,
                      { algorithm: "RS256" }
                    );
                    res.cookie("access_token", newAccessToken, {
                      httpOnly: true,
                    });
                    req.user = decoded.userId;
                    next();
                  }
                }
              );
            } else {
              // The access token is invalid for a reason other than expiration.
              console.error(err);
              res.status(401).send("Unauthorized: Invalid token");
            }
          } else {
            // The access token is valid. Continue.
            req.user = decoded.userId;
            next();
          }
        }
      );
    } else {
      res.status(401).send("Unauthorized: No token provided");
    }
  } catch (err) {
    console.error("Error reading key files:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const dynamicAuth = async (req, res, next) => {
  // Async handler not required as there is no await
  try {
    // Check if authenticated with google
    if (req.cookies.access_token && req.cookies.refresh_token) {
      return googleJwtMiddleware(req, res, next);
    }
    // Check if authenticated with email and password
    if (req.cookies.authToken) {
      return auth(req, res, next);
    }
    // Not authenticated if either of above is not present
    return res.status(401).json(new ApiError(401, "Authentication Required"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Authentication Failure", error));
  }
};

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
