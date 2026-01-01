import { Conversation } from "../models/conversastion.models.js";
import { Appointment } from "../models/Appointment.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createConversastion = asyncHandler(async (req, res) => {
  const senderId = req.user.userId;
  const { AppointmentId } = req.body;

  if (!AppointmentId) {
    throw new ApiError(400, "Appointment Id is required");
  }

  const appointment = await Appointment.findById(AppointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  // ✅ Calculate session time window
  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(
    startTime.getTime() + appointment.duration_minutes * 60000
  );
  const now = new Date();

  if (now < startTime || now > endTime) {
    throw new ApiError(403, "Session is not active");
  }

  // ✅ Permission check
  if (
    !appointment.user_id.equals(senderId) &&
    !appointment.counsellor_id.equals(senderId)
  ) {
    throw new ApiError(403, "Not allowed");
  }

  const members = [
    appointment.user_id,
    appointment.counsellor_id
  ];

  // ✅ Check existing conversation
  let conversation = await Conversation.findOne({
    isGroup: false,
    sessionId: AppointmentId,
    members: { $all: members }
  });

  if (conversation) {
    return res.status(200).json(
      new ApiResponse(200, conversation, "Conversation already exists")
    );
  }

  // ✅ Create conversation
  conversation = await Conversation.create({
    members,
    sessionId: AppointmentId,
    isGroup: false,
    lastMessageAt: new Date()
  });

  return res.status(201).json(
    new ApiResponse(201, conversation, "Conversation created")
  );
});

export const getChat = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Find all conversations where user is a member
  const conversations = await Conversation.find({
    members: userId,
  })
    .populate("members", "userName Email profileImg")
    .sort({ lastMessageAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, conversations, "Chats fetched successfully")
  );
});
