import express from "express";
import { AppointmentController } from "../controllers/index.js";
import auth, {
  adminVerify,
  counsellorVerify,
  dynamicAuth,
} from "../middlewares/auth.middlewares.js";

const AppointmentRouter = express.Router();

// create user-books-appointment
AppointmentRouter.post(
  "/",
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
  dynamicAuth,
  counsellorVerify,
  AppointmentController.getCounsellorAppointments
);
// AppointmentRouter.get("/", AppointmentController.getAllAppointments);
// AppointmentRouter.get("/:id", AppointmentController.getAppointmentById);

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
