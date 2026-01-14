import { Router } from "express";
import { UserController } from "../controllers/index.js";

export const AdminRouter = Router();

AdminRouter.get("/get-all-users", UserController.getAllUsers);
AdminRouter.get("/get-user-by-id/:id", UserController.getUserById);
AdminRouter.patch("/update-user-status/:id", UserController.updateUserStatusById);
AdminRouter.patch("/update-user-role/:id", UserController.updateUserRoleById);
AdminRouter.delete("/delete-user/:id", UserController.deleteUserById);
