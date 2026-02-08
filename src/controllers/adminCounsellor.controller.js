import { Appointment } from "../models/Appointments.model.js";
import { Counsellor } from "../models/Counsellor.models.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.js";
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

// Get canceled appointments length
export const getCanceledAppointmentsLength = asyncHandler(async (req, res) => {
  const canceledAppointments = await Appointment.find({ status: "cancelled" });
  if (canceledAppointments.length === 0) {
    return res.status(204).json(new ApiError(404, "no canceled appointments"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, canceledAppointments.length, "ok"));
});

// Get canceled appointments
export const getCanceledAppointments = asyncHandler(async (req, res) => {
  const canceledAppointments = await Appointment.find({ status: "cancelled" });
  if (canceledAppointments.length === 0) {
    return res.status(404).json(new ApiError(404, "no canceled appointments"));
  }
  return res.status(200).json(new ApiResponse(200, canceledAppointments, "ok"));
});

export const getLatestCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await Counsellor.find({})
    .sort({ createdAt: -1 }) // newest first
    .limit(2) // only latest 2
    .select("fullname email createdAt");

  if (!counsellors || counsellors.length === 0) {
    return res.status(404).json(new ApiError(404, "No counsellors found"));
  }

  const formatted = counsellors.map((c) => ({
    id: c._id,
    name: c.fullname,
    email: c.email,
    applied: timeAgo(c.createdAt),
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Latest counsellors fetched"));
});

// helper function
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (let key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) return `${interval}${key[0]} ago`;
  }
  return "just now";
};

export const getWeeklyRevenue = async (req, res) => {
  try {
    // ==============================
    // 1️⃣ Use UTC-safe date boundaries
    // ==============================
    const now = new Date();

    // Start of today (UTC)
    const endDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59
      )
    );

    // 4 weeks ago (start of day)
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 27); // inclusive 28 days

    // ==============================
    // 2️⃣ Aggregate revenue
    // ==============================
    const revenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          payment_status: "successful",
          is_deleted: false,
        },
      },
      {
        $addFields: {
          weekIndex: {
            $floor: {
              $divide: [
                { $subtract: ["$createdAt", startDate] },
                1000 * 60 * 60 * 24 * 7,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$weekIndex",
          totalRevenue: { $sum: "$price" },
        },
      },
    ]);

    // ==============================
    // 3️⃣ Always return 4 weeks
    // ==============================
    const weeklyRevenue = Array(4).fill(0);

    revenue.forEach((item) => {
      if (item._id >= 0 && item._id < 4) {
        weeklyRevenue[item._id] = item.totalRevenue;
      }
    });

    // ==============================
    // 4️⃣ Return chart-ready response
    // ==============================
    return res.status(200).json({
      success: true,
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Revenue",
            data: weeklyRevenue,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.2)",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Weekly Revenue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch weekly revenue",
    });
  }
};

export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find();
  if (appointments.length === 0) {
    return res
      .status(204)
      .json(new ApiResponse(204, null, "no appointments found"));
  }
  return res.status(200).json(new ApiResponse(200, appointments, "ok"));
});
