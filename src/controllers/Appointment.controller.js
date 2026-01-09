import { Appointment } from "../models/Appointments.model.js";
import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// ........Get All Appointments.................
export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ is_deleted: false })
    .populate("user_id", "name email")
    .populate("counsellor_id", "name");

  res.status(200).json(
    new ApiResponse(200, {
      result: appointments.length,
      data: appointments,
    })
  );
});

//............ Get Appointment details by Id..........
export const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id)
    .populate("user_id", "fullname email")
    .populate("counsellor_id", "fullname email");

  if (!appointment) {
    return res.status(400).json(new ApiError(400, "No Appointment found"));
  }
  res.status(200).json(new ApiResponse(200, appointment, "ok"));
});

//.............. Create Appointment.....................
export const createAppointment = asyncHandler(async (req, res) => {
  const user_id = req.user.userId || req.user._id;

  const {
    counsellor_id,
    scheduled_at,
    duration_minutes,
    session_type,
    price,
    notes,
  } = req.body;

  // 1️⃣ Basic validation
  if (!counsellor_id || !scheduled_at || !duration_minutes || !price) {
    return res
      .status(400)
      .json(new ApiError(400, "Required fields are missing..."));
  }

  const start = new Date(scheduled_at);

  // Prevent past appointments
  if (start < new Date()) {
    return res
      .status(400)
      .json(new ApiError(400, "Appointment time must be in future!"));
  }
  const end = new Date(start.getTime() + duration_minutes * 60000);

  // Proper overlap check
  const conflict = await Appointment.findOne({
    counsellor_id,
    status: "scheduled",
    scheduled_at: { $lt: end },
    $expr: {
      $gt: [
        {
          $add: ["$scheduled_at", { $multiply: ["$duration_minutes", 60000] }],
        },
        start,
      ],
    },
  });

  if (conflict) {
    return res
      .status(409)
      .json(
        new ApiError(
          409,
          "counsellor is already booked with another session for given time"
        )
      );
  }

  const appointment = await Appointment.create({
    user_id,
    counsellor_id,
    scheduled_at: start,
    duration_minutes,
    session_type,
    price,
    notes,
    reminderSent: false,
  });

  res.status(201).json(new ApiResponse(201, appointment));
});

export const getUserAppointments = asyncHandler(async (req, res) => {
  const {
    scope,
    status,
    from,
    to,
    page = 1,
    limit = 10,
    sort = "asc",
  } = req.query;

  const userId = req.user._id || req.user.userId;

  const query = {
    user_id: userId,
  };

  const now = new Date();

  if (scope === "upcoming") {
    query.scheduled_at = { $gte: now };
  } else if (scope === "past") {
    query.scheduled_at = { $lt: now };
  }

  if (status) {
    query.status = status;
  }

  if (from || to) {
    query.scheduled_at = {
      ...(query.scheduled_at || {}),
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate("counsellor_id", "name")
    .sort({ scheduled_at: sort === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit));

  if (appointments.length == 0) {
    return res.status(200).json({
      success: true,
      message: "No Appointments",
    });
  }

  res.status(200).json(
    new ApiResponse(200, {
      page: Number(page),
      limit: Number(limit),
      count: appointments.length,
      data: appointments,
    })
  );
});

export const getCounsellorAppointments = asyncHandler(async (req, res) => {
  const {
    scope,
    status,
    from,
    to,
    page = 1,
    limit = 10,
    sort = "asc",
  } = req.query;

  const query = {
    counsellor_id: req.user._id,
  };

  const now = new Date();

  if (scope === "upcoming") {
    query.scheduled_at = { $gte: now };
  } else if (scope === "past") {
    query.scheduled_at = { $lt: now };
  }

  if (status) {
    query.status = status;
  }

  if (from || to) {
    query.scheduled_at = {
      ...(query.scheduled_at || {}),
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate("user_id", "name email")
    .sort({ scheduled_at: sort === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(
    new ApiResponse(200, {
      page: Number(page),
      limit: Number(limit),
      count: appointments.length,
      data: appointments,
    })
  );
});

// ..........update Appointment.....................
export const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent updating delete flag & timestamps manually
  const forbiddenFields = ["is_deleted", "createdAt", "updatedAt", "status"];
  forbiddenFields.forEach((field) => delete req.body[field]);

  const appointment = await Appointment.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!appointment) {
    return res.status(404).json(new ApiError(404, "Appointment not found"));
  }

  res.status(200).json(
    new ApiResponse(200, {
      message: "Appointment updated sucessfully",
      data: appointment,
    })
  );
});

// update the status of appointment
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    { status: status },
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return res.status(404).json({
      message: "Appointment not found or already deleted",
    });
  }

  res.status(200).json(new ApiResponse(200, appointment));
});

//................. Delete Appointment..............
export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    { is_deleted: true },
    { new: true }
  );

  if (!appointment) {
    return res
      .status(404)
      .json(new ApiError(404, "appointment not found or deleted"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "appointment deletion successful (soft)"));
});
