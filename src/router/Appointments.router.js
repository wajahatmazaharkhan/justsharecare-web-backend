import express from "express";
import { AppointmentController } from "../controllers/index.js";
import auth, {
  adminVerify,
  counsellorVerify,
} from "../middlewares/auth.middlewares.js";

const AppointmentRouter = express.Router();

// create user-books-appointment
AppointmentRouter.post("/", auth, AppointmentController.createAppointment);

// read
AppointmentRouter.get("/user", auth, AppointmentController.getUserAppointments);
AppointmentRouter.get(
  "/counsellor",
  auth,
  counsellorVerify,
  AppointmentController.getCounsellorAppointments
);
// AppointmentRouter.get("/", AppointmentController.getAllAppointments);
// AppointmentRouter.get("/:id", AppointmentController.getAppointmentById);

// update
AppointmentRouter.patch("/:id", auth, AppointmentController.updateAppointment);
AppointmentRouter.patch(
  "/:id/status",
  auth,
  AppointmentController.updateAppointmentStatus
);

// delete
AppointmentRouter.delete("/:id", auth, AppointmentController.deleteAppointment);

export { AppointmentRouter };
