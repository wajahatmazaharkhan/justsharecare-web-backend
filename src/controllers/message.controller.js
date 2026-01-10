import { Message } from "../models/message.models.js";
import { Appointment } from "../models/Appointments.model.js";
import { Conversation } from "../models/conversastion.models.js";
import { ImagekitFileUploader } from "../services/imagekit.services.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { encryptText, decryptText } from "../security/aes-encryption.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user.userId;
  const { conversationId, text, emoji } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  if (!text && !req.files?.length) {
    throw new ApiError(400, "Message text or attachment required");
  }

  // 1️⃣ Validate conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // 2️⃣ Check membership
  if (!conversation.members.some((id) => id.equals(senderId))) {
    throw new ApiError(403, "You are not allowed to send message");
  }

  // 3️⃣ Validate appointment session
  const appointment = await Appointment.findById(conversation.sessionId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(
    startTime.getTime() + appointment.duration_minutes * 60000
  );

  const now = new Date();
  if (now < startTime || now > endTime) {
    throw new ApiError(403, "Chat session has expired");
  }

  // 4️⃣ Upload attachments (ImageKit)
  let attachments = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) => ImagekitFileUploader(file.path))
    );

    attachments = uploads
      .filter(Boolean)
      .map((file) => file.url || file.secure_url);
  }

  // 5️⃣ Encrypt message text
  let encryptedText = null;
  let key = null;

  if (text) {
    const cipher = await encryptText(text);
    encryptedText = cipher.encryptedHex;
    key = cipher.key;
  }

  // 6️⃣ Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text: encryptedText,
    key,
    emoji,
    attachments,
  });

  // 7️⃣ Update conversation activity
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!conversation.members.some((id) => id.equals(userId))) {
    throw new ApiError(403, "You are not allowed to view messages");
  }

  const messages = await Message.find({
    conversation: conversationId,
  }).sort({ createdAt: 1 });

  for (const msg of messages) {
    if (msg.text && msg.key) {
      try {
        msg.text = await decryptText(msg.key, msg.text);
      } catch {
        msg.text = "[decryption failed]";
      }
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});
