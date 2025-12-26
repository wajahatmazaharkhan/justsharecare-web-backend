import express from "express";
import auth from "../middlewares/auth.middlewares.js";

const AvailabilityRouter = express.Router();

AvailabilityRouter.post("/add", auth);

export { AvailabilityRouter };
