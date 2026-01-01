import { Router } from "express";

import { ChatController } from "../controllers/index.js";

export const chatRouter = Router();

chatRouter.route("/addconversastion").post(ChatController.createConversastion);
chatRouter.route("/getchat").get(ChatController.getChat);
