// ===============================================
// Controllers Index File
// File: index.js
// ===============================================
//
// • This file works as a central export hub for ALL controllers.
//   Instead of importing controllers individually from each file,
//   you can import them all from this index.js.
//
//     Example:
//     import { FormController } from "../controllers/index.js";
//
// • Helps maintain a clean folder structure and avoids messy imports.
//
// • Add new controllers here as your project grows.
//
// ===============================================

import { FormController } from "./Form.controllers.js";
import { SignUp ,Login , amdinLogin, sendEmailOtp , VerifyOtp ,getHistory ,passwordOtp ,VerifyPasswordResetOtp ,resetPassword} from "./User.controllers.js";
import { CounsellorSignup , CounsellorLogin , getallCounsellor, getCounsellorByEmail } from "./Counsellor.controllers.js";

// Export all controllers together
export {
    FormController,
    SignUp,
    Login,
    amdinLogin,
    sendEmailOtp,
    VerifyOtp,
    getHistory,
    CounsellorLogin,
    CounsellorSignup,
    getallCounsellor,
    getCounsellorByEmail,
    passwordOtp,
    resetPassword,
    VerifyPasswordResetOtp
};
