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

export const createRazorpayOrder = async (req, res) => {
  let options;
  try {
    options = OrderValidation.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation Failed!", error.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.error("An unexpected error occurred during validation:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  }
  if (!options.currency || !options.amount) {
    return res.status(404).json({ msg: "All fields are required" });
  }
  const order = await instance.orders.create(options);
  console.log("Order created", order);
  return res.status(200).json({ success: true, order });
};
