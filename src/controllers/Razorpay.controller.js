// ===============================================
// Controller: Form
// File: Razorpay.controllers.js
// ===============================================
//
// • File name starts with Capital (Razorpay.controllers.js)
//   because it represents a controller class/module.
//
// • ".controllers.js" clearly indicates this file contains
//   request-handling logic for the Form model.
//
// • Follows best practices:
//     - Zod validation for input
//     - Proper async/await usage
//     - Return statements to prevent duplicate responses
//     - Clean Fastify-compatible response format
//
// ===============================================

import { ZodError } from "zod";
import { instance } from "../../server.js";
import { OrderValidation } from "../validator/Razorpay.validation.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Payment } from "../models/Payment.model.js";
import crypto from "crypto";

export const createRazorpayOrder = async (req, res) => {
  let options;
  try {
    options = OrderValidation.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation Failed!", error.message);
      return res
        .status(400)
        .json(new ApiError(400, "Validation failure", error.errors));
    } else {
      console.error("An unexpected error occurred during validation:", error);
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
  }
  if (!options.currency || !options.amount) {
    return res.status(400).json(new ApiError(400, "all fields are required"));
  }
  const order = await instance.orders.create(options);
  console.log("Order created", order);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order created successfully"));
};

export const getRazorpayKeys = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, process.env.RAZORPAY_KEY_ID));
});

export const paymentVerification = async (req, res) => {
  // Avoiding Async-handler because inner try-catch block is required.
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(req.body);
  console.log("// --- CHECKING PAYMENT STATUS --- //");
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;
    if (!isSignatureValid) {
      console.log("PAYMENT VERIFICATION FAILED INVALID SIGNATURE");
      return res
        .status(400)
        .json(new ApiError(400, "Invalid Payment Signature"));
    }
    console.log("PAYMENT VERIFIED SUCCESSFULLY");
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Payment Verified Successfully"));
  } catch (error) {
    console.error("Payment verification error:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Payment verification failed"));
  }
};
