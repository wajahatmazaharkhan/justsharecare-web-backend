import { Appointment } from "../models/Appointments.model.js";
import { Counsellor } from "../models/Counsellor.models.js";
import { User } from "../models/User.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";

/* ================= GET ALL COUNSELLORS WITH USER ================= */
export const getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find()
      .populate("user_id", "fullname email role status")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: counsellors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= APPROVE COUNSELLOR ================= */
export const approveCounsellor = async (req, res) => {
  try {
    const { id } = req.params;

    const counsellor = await Counsellor.findByIdAndUpdate(
      id,
      { Admin_approved: true },
      { new: true }
    );

    if (!counsellor)
      return res.status(404).json({ message: "Counsellor not found" });

    await User.findByIdAndUpdate(counsellor.user_id, { isVerified: true });

    res.json({ success: true, message: "Counsellor Approved", counsellor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCounsellorCount = asyncHandler(async (req, res) => {
  const counsellorLength = (await Counsellor.find()).length;
  return res
    .status(200)
    .json(new ApiResponse(200, counsellorLength, "length found"));
});

export const getPendingVerifications = asyncHandler(async (req, res) => {
  let pendingVerificationCount = 0;
  const pendingUsers = (await User.find({ isVerified: false })).length;
  const pendingCounsellors = (await Counsellor.find({ Admin_approved: false }))
    .length;
  pendingVerificationCount += pendingUsers;
  pendingVerificationCount += pendingCounsellors;
  return res
    .status(200)
    .json(new ApiResponse(200, pendingVerificationCount, "length found"));
});

export const getRegisteredCount = asyncHandler(async (req, res) => {
  const registeredUsers = await User.countDocuments({ isVerified: true });

  const registeredCounsellors = await Counsellor.countDocuments({
    Admin_approved: true,
  });

  const registeredCounts = registeredUsers + registeredCounsellors;

  return res
    .status(200)
    .json(new ApiResponse(200, registeredCounts, "length found"));
});

export const getTotalAppointments = asyncHandler(async (req, res) => {
  const totalAppointments = await Appointment.countDocuments();
  return res.status(200).json(new ApiResponse(200, totalAppointments, "ok"));
});

export const getCurrentMonthRevenue = asyncHandler(async (req, res) => {
  // get today's date
  const dateToday = new Date();
  // get current date
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  // select counsellor approved appointments
  const counsellorApprovedAppointments = await Appointment.find({
    createdAt: {
      $gte: startDate,
      $lt: dateToday,
    },
  }).lean();
  // map through approved appointments and collect & sum price
  const totalRevenueThisMonth = counsellorApprovedAppointments.reduce(
    (acc, val) => acc + val.price,
    0
  );

  res.status(200).json(new ApiResponse(200, totalRevenueThisMonth, "ok"));
});
