// ===============================================
// Router: Form
// File: Form.router.js
// ===============================================
//
// • This file contains all routes related to the Form module.
//
// • File name starts with Capital (Form.router.js)
//   because routers represent a feature/module in the project.
//
// • Centralized import from `controllers/index.js`
//   so we don’t need long import paths.
//
// • Router uses Express.js `Router()` to define endpoints
//   related only to Form operations.
//
// ===============================================

import { Router } from "express";
import { FormController } from "../controllers/index.js";


export const FormRouter = Router();

// -------------------------
// POST  /submit
// Description: Submit new form
// -------------------------
FormRouter.route("/submit").post(FormController);
//FormRouter.post("/submit",FormController);
//--------------------------

// ===============================================
// EXAMPLES (Add when project grows)
// ===============================================
//
// FormRouter.route("/all").get(GetAllFormsController);
//
// FormRouter.route("/:id").get(GetSingleFormController);
//
// FormRouter.route("/update/:id").put(UpdateFormController);
//
// FormRouter.route("/delete/:id").delete(DeleteFormController);
//
// ===============================================
