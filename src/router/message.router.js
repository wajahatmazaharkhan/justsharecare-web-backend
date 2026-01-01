import { Router } from "express";
import { MessageController } from "../controllers/index.js";
import { upload } from "../middlewares/multer.middlewares.js";

export const messageRouter = Router();

messageRouter.route("/sendmessage").post(upload.array("attachments",10) , MessageController.sendMessage )
messageRouter.route("/getmessage/:conversationId").get(MessageController.getMessages);