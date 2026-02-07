import express from "express";
import { AppointmentController } from "../controllers/index.js";
import {
  adminVerify,
  counsellorVerify,
  dynamicAuth,
} from "../middlewares/auth.middlewares.js";

const AppointmentRouter = express.Router();

// create user-books-appointment
AppointmentRouter.post(
  "/create",
  dynamicAuth,
  AppointmentController.createAppointment
);

// read
AppointmentRouter.get(
  "/user",
  dynamicAuth,
  AppointmentController.getUserAppointments
);
AppointmentRouter.get(
  "/counsellor",
  counsellorVerify,
  AppointmentController.getCounsellorAppointments
);

AppointmentRouter.patch(
  "/:appointmentId/approve",
  dynamicAuth,
  counsellorVerify,
  AppointmentController.approveAppointmentByCounsellor
);

// update
AppointmentRouter.patch(
  "/:id",
  dynamicAuth,
  AppointmentController.updateAppointment
);
AppointmentRouter.patch(
  "/:id/status",
  dynamicAuth,
  AppointmentController.updateAppointmentStatus
);

// delete
AppointmentRouter.delete(
  "/:id",
  dynamicAuth,
  AppointmentController.deleteAppointment
);

export { AppointmentRouter };
