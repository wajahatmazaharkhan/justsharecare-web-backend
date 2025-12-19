import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  CounsellorSignup,
  CounsellorLogin,
  getallCounsellor,
  getCounsellorByEmail,
} from "../controllers/index.js";

export const counsellorRouter = Router();

counsellorRouter.post(
  "/signup",
  upload.fields([
    { name: "government_id", maxCount: 1 },
    { name: "profile_picture", maxCount: 1 },
    { name: "qualification_certificates", maxCount: 1 },
    { name: "licence", maxCount: 1 },
    { name: "experince_letter", maxCount: 1 },
    { name: "additional_documents", maxCount: 1 },
  ]),
  CounsellorSignup
);

counsellorRouter.post("/login", CounsellorLogin);
counsellorRouter.get("/getcounsellor", getallCounsellor);
counsellorRouter.get("/getcounsellorbyemail/:email", getCounsellorByEmail);
