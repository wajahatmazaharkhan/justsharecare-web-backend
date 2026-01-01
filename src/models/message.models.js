import mongoose from "mongoose";
import { Conversation } from "../models/conversastion.models.js";
import { User } from "../models/User.models.js";

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  attachments: [String],
  emoji: String,
}, { timestamps: true });


export const Message = mongoose.model("Message", messageSchema);