import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { UserController } from "../controllers/index.js";
import auth, {
  adminVerify,
  counsellorVerify,
  dynamicAuth,
  googleJwtMiddleware,
} from "../middlewares/auth.middlewares.js";
import passport from "../config/passport-config.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.models.js";

export const userRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

userRouter.post("/signup", UserController.SignUp);
userRouter.post("/login", UserController.Login);

userRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
    // scope:
    //   "https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.phonenumbers.read",
  })
);

const isProd = process.env.NODE_ENV === "production";

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res, next) => {
    try {
      const privateKey = fs.readFileSync(
        path.join(__dirname, "../private.key"),
        "utf8"
      );
      const token = jwt.sign({ userId: req.user.id }, privateKey, {
        algorithm: "RS256",
      });
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Lax",
      });
      res.cookie("refresh_token", token, {
        httpOnly: false,
        secure: isProd,
        sameSite: "Lax",
      });
      res.redirect(
        `${process.env.API_URL}/verify-token/?token=${token}`
      );
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

userRouter.get("/current-user", dynamicAuth, (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      // res.cookie("XSRF-TOKEN", req.csrfToken());
      res.status(200).json(new ApiResponse(200, user, "authenticated"));
    })
    .catch((err) => {
      console.log("err", err);
      next(err);
    });
});

userRouter.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json(new ApiError(500, "could not log out, please try again!"));
    }

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
    };

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);
    res.clearCookie("authToken", cookieOptions);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  });
});

userRouter.get("/info", dynamicAuth, UserController.getUserInfo);
userRouter.post("/adminlogin", UserController.amdinLogin);
userRouter.post("/otp-for-password/:email", UserController.sendEmailOtp);
userRouter.post("/verify-otp", UserController.VerifyOtp);
userRouter.get("/getHistory", counsellorVerify, UserController.getHistory);
userRouter.get("/getHistoryByAdmin", adminVerify, UserController.getHistory);
userRouter.post("/password-reset-otp", UserController.passwordOtp);
userRouter.post("/verify-password-otp", UserController.VerifyPasswordResetOtp);
userRouter.post("/reset-password", UserController.resetPassword);
