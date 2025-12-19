import { Router } from "express";

import {
  SignUp,
  Login,
  amdinLogin,
  sendEmailOtp,
  getHistory,
  VerifyPasswordResetOtp,
  resetPassword,
  passwordOtp,
  VerifyOtp
} from "../controllers/index.js";
import {
  adminVerify,
  counsellorVerify,
} from "../middlewares/auth.middlewares.js";

export const userRouter = Router();

userRouter.post("/signup", SignUp);
userRouter.post("/login", Login);
userRouter.post("/adminlogin", amdinLogin);
userRouter.post("/otp-for-password/:email", sendEmailOtp);
userRouter.post("/verifyotp",VerifyOtp)
userRouter.get("/getHistory", counsellorVerify, getHistory);
userRouter.get("/getHistoryByAdmin", adminVerify, getHistory);
userRouter.post("/passwordresetotp",passwordOtp);
userRouter.post("/verifypasswordotp",VerifyPasswordResetOtp);
userRouter.post("/resetpassword",resetPassword);


