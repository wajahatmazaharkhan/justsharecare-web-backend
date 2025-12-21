// ===============================================
// Controller: Form
// File: Form.controllers.js
// ===============================================
//
// • File name starts with Capital (Form.controllers.js)
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

import { Form } from "../models/Form.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { FormValidation } from "../validator/Form.validation.js";

export const FormController = asyncHandler(async (req, res) => {
  // 1. Validate input (Zod throws automatically)
  const data = FormValidation.parse(req.body);

  // 2. Create form
  const newform = await Form.create({
    fullname: data.fullname,
    number: data.number,
  });

  if (!newform) {
    throw new ApiError(500, "Error occurred while creating the form");
  }

  // 3. Success response
  res.status(201).json({
    success: true,
    msg: "Form created successfully",
    form: newform,
  });
});
