import { Router } from "express";
import { AdminController } from "../controllers/index.js";
import { adminVerify } from "../middlewares/auth.middlewares.js";

export const AdminRouter = Router();

AdminRouter.get("/get-all-users", AdminController.getAllUsers);
AdminRouter.get("/get-user-by-id/:id", AdminController.getUserById);
AdminRouter.patch("/update-user-status/:id", AdminController.updateUserStatusById);
AdminRouter.patch("/update-user-role/:id", AdminController.updateUserRoleById);
AdminRouter.delete("/delete-user/:id", AdminController.deleteUserById);
