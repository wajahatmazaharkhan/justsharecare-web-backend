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

const auth = (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  const authToken = req.cookies.authToken;
  try {
    const publicKey = fs.readFileSync(
      path.join(__dirname, "../public.key"),
      "utf-8"
    );
    if (accessToken && refreshToken) {
      jwt.verify(
        accessToken,
        publicKey,
        { algorithms: ["RS256"] },
        (err, decoded) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              // access token is expired. Try to refresh it.
              jwt.verify(
                refreshToken,
                publicKey,
                { algorithms: ["RS256"] },
                (err, decoded) => {
                  if (err) {
                    // refresh token is also invalid or expired. the user needs to login again.
                    res
                      .status(401)
                      .json(new ApiError("Unauthorized: Invalid token"));
                  } else {
                    // refresh token is valid. Generate a new accessToken and continue
                    const privateKey = fs.readFileSync(
                      path.join(__dirname, "../private.key"),
                      "utf-8"
                    );
                    const newAcessToken = jwt.sign(
                      { userId: decoded.userId },
                      privateKey,
                      { algorithm: "RS256" }
                    );
                    res.cookie("access_token", newAcessToken, {
                      httpOnly: true,
                    });
                    req.user = decoded.userId;
                    next();
                  }
                }
              );
            } else {
              // access token is invalid for a reason other than expiration.
              console.error(err);
              res.status(401).json(new ApiError("Unauthorized: Invalid Token"));
            }
          } else {
            // access token is valid. Continue.
            req.user = decoded.userId;
            next();
          }
        }
      );
    } else {
      // user may not have used google login method. Normal email password;
      if (!authToken || (!accessToken && !refreshToken)) {
        return res
          .status(401)
          .json(new ApiError(401, "Unauthorized: No token provided"));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
      } catch (error) {
        return res
          .status(401)
          .json(new ApiError(401, "Invalid Token Provided"));
      }
    }
  } catch (error) {}
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
