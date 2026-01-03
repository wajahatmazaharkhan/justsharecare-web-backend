import { Router } from "express";
import { AdminController } from "../controllers/index.js";

export const AdminRouter = Router();

AdminRouter.get("/get-all-users", AdminController.getAllUsers);
