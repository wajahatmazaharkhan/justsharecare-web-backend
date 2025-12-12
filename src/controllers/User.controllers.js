import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";
import bcrypt from "bcryptjs";
//otp service imports
import { sendOtpEmail } from "../services/OtpEmailVerification.js";
// validator imports
import { SignupValidation, LoginValidation, AdminLoginValidation ,UserUpdateValidation} from "../validator/User.validation.js";
// signup user controller function //
export const SignUp = async (req, res) => {
    try {
        const data = SignupValidation.parse(req.body);

        // ✅ Check if user already exists
        const oldUser = await User.findOne({ email: data.email });

        if (oldUser) {
            return res.status(409).json({
                success: false,
                msg: "User already exists"
            });
        }

        // ✅ Create user with additional fields
        const newUser = await User.create({
            fullname: data.fullname,
            email: data.email,
            phone_number: data.phone_number,
            Password: data.Password, // model hashes it
            dob: data.dob,
            gender: data.gender,
            timezone: data.timezone,
            preferred_language: data.preferred_language
        });

        if (!newUser) {
            return res.status(400).json({
                success: false,
                msg: "User not created"
            });
        }

        return res.status(201).json({
            success: true,
            msg: "User created successfully",
            user: {
                fullname: newUser.fullname,
                email: newUser.email,
                phone_number: newUser.phone_number,
                dob: newUser.dob,
                gender: newUser.gender,
                timezone: newUser.timezone,
                preferred_language: newUser.preferred_language
            }
        });
    } catch (error) {
        // ✅ Zod Validation Error
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                msg: "Validation error",
                errors: error.errors
            });
        }

        console.log("Controller Error:", error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

// login user controller function //
export const Login = async (req, res) => {
    try {
        const data = LoginValidation.parse(req.body);

        // get existed user 

        const userExisted = await User.findOne({ email: data.email });
        const user = await userExisted.comparePassword(data.Password);

        await User.updateOne(
            { _id: userExisted._id },
            { $set: { last_login: new Date() } }
        );


        const token = userExisted.generateAuthToken();

        // cookie option
        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // secure: false, // Set to true if using HTTPS
        };

        if (user) {
            res
                .status(200)
                .cookie("authToken", token, option)
                .json({
                    message: "Login successful",
                    token,
                    user: {
                        id: userExisted._id,
                        fullname: userExisted.fullname,
                        email: userExisted.email,
                        role: userExisted.role
                    }
                });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }

    } catch (error) {
        // Zod Validation Error Handling
        if (error.name === "ZodError") {
            return res.status(400).json({
                msg: "Validation error",
                errors: error.errors,
            });
        }

        console.log("Controller Error:", error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}

// admin mogin controller function //
export const amdinLogin = async (req, res) => {
    try {
        const data = AdminLoginValidation.parse(req.body);

        const userExisted = await User.findOne({ email: data.email });

        if(!userExisted){
            return res.status(404).json({ msg : "user not found"})
        }

        if (userExisted.role != "admin") {
            return res.status(402).json({ msg : "only admin can login"})
        }

        const user = await userExisted.comparePassword(data.Password);

        if(!user){
            return res.status(400).json({msg : "email or password maybe not correct"})
        }
        const token =  userExisted.generateAuthToken();

        // cookie option
        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // secure: false, // Set to true if using HTTPS
        };

        if (user) {
            res
                .status(200)
                .cookie("authToken", token, option)
                .json({
                    message: "Login successful",
                    token,
                    user: {
                        id: userExisted._id,
                        fullname: userExisted.fullname,
                        email: userExisted.email,
                        role: userExisted.role
                    }
                });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }

    } catch (error) {
        console.log(error)
    }
}

// function for send verify otp using nodemailer
export const sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.params; // use lowercase standard

        if (!email) {
            return res.status(400).json({
                success: false,
                msg: "Email is required",
            });
        }

        // ✅ Find user by email
        const userFound = await User.findOne({ email });

        if (!userFound) {
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        }

        // ✅ Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // ✅ Hash OTP
        const hashedOtp = await bcrypt.hash(otp, 10);

        // ✅ Expiry time (5 minutes)
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        // ✅ Save OTP in DB
        userFound.otp = hashedOtp;
        userFound.otpExpiry = otpExpiry;
        await userFound.save();

        // ✅ Send OTP email
        await sendOtpEmail(userFound.fullname, userFound.email, otp);

        return res.status(200).json({
            success: true,
            msg: "OTP sent successfully to your email",
        });
    } catch (error) {
        console.error("Send OTP Error:", error);

        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};

// NEWLY ADDED: Verify OTP Function

export const VerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Basic Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                msg: "Email and OTP are required"
            });
        }

        // 2. Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        // 3. Check if OTP is expired
        if (user.otpExpiry && user.otpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                msg: "OTP has expired. Please request a new one."
            });
        }

        // 4. Verify OTP 
        
        const isMatch = await bcrypt.compare(otp, user.otp || "");

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: "Invalid OTP. Please check your code."
            });
        }

        // 5. Success - 
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.is_verified = true; // Assuming you have an 'is_verified' field in model

        await user.save();

        return res.status(200).json({
            success: true,
            msg: "Email verified successfully!"
        });

    } catch (error) {
        console.error("Verify OTP Controller Error:", error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

// get user history 
export const getHistory = async (req, res) => {
  try {
    const { counsellorId } = req.params;

    if (!counsellorId) {
      return res.status(400).json({ 
        success: false, 
        msg: "counsellorId is required" 
      });
    }

    // ✅ Find counsellor and populate history.customerId to get user details
    const counsellor = await Counsellor.findById(counsellorId)
      .populate("history.customerId", "fullname email phone_number");

    if (!counsellor) {
      return res.status(404).json({ 
        success: false, 
        msg: "Counsellor not found" 
      });
    }

    // ✅ Optionally sort by latest visit first
    const sortedHistory = counsellor.history.sort(
      (a, b) => b.visitDate - a.visitDate
    );

    return res.status(200).json({
      success: true,
      history: sortedHistory
    });

  } catch (error) {
    console.error("Get History Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error"
    });
  }
};


/**
 * Controller to update logged-in user's profile details.
 */
export const updateUserProfile = async (req, res) => {
    try {
        const data = UserUpdateValidation.parse(req.body);

        //  Get the User ID from the middleware (req.user)
        const userId = req.user.userId;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true, runValidators: true }
        ).select("-Password -otp -otpExpiry");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                msg: "User not found."
            });
        }

        // 4. Return success response
        return res.status(200).json({
            success: true,
            msg: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        // Handle Validation Errors
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                msg: "Validation Error",
                errors: error.errors
            });
        }
        
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
