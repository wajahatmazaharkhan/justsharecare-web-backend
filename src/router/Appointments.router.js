import express from "express";
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  getCounsellorAppointments,
  getUserAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../controllers/Appointment.controller.js";
import auth, {
  adminVerify,
  counsellorVerify,
} from "../middlewares/auth.middlewares.js";

const AppointmentRouter = express.Router();

// create  user-books-appointment
AppointmentRouter.post("/", auth, createAppointment);

// Read
AppointmentRouter.get("/user", auth, getUserAppointments);
AppointmentRouter.get(
  "/counsellor",
  auth,
  counsellorVerify,
  getCounsellorAppointments
);
// AppointmentRouter.get("/", getAllAppointments);
// AppointmentRouter.get("/:id", getAppointmentById);

// update
AppointmentRouter.patch("/:id", auth, updateAppointment);
AppointmentRouter.patch("/:id/status", auth, updateAppointmentStatus);

// delete
AppointmentRouter.delete("/:id", auth, deleteAppointment);

export { AppointmentRouter };
