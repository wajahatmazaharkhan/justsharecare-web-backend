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
