// ===============================================
// Router: Razorpay
// File: Razorpay.router.js
// ===============================================
//
// • This file contains all routes related to the Form module.
//
// • File name starts with Capital (Razorpay.router.js)
//   because routers represent a feature/module in the project.
//
// • Centralized import from `controllers/index.js`
//   so we don’t need long import paths.
//
// • Router uses Express.js `Router()` to define endpoints
//   related only to Form operations.
//
// ===============================================

import {Router} from "express";
import { createRazorpayOrder } from "../controllers/Razorpay.controller.js";

export const RazorpayRouter = Router();

RazorpayRouter.route("/create-order").post(createRazorpayOrder)