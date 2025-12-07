import { Router } from "express";

import { SignUp ,Login } from "../controllers/index.js";

export const userRouter = Router();

userRouter.post("/signup" , SignUp);
userRouter.post("/login",Login);