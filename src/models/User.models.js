import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  phone_number: {
    type: String,
    sparse: true
  },
  Password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "counsellor", "admin"],
    default: "user",
    index: true
  },

  dob: Date,
  gender: String,

  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "active"
  },

  preferred_language: String,
  timezone: String,
  last_login: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  passwordOtpVerify :{
    type : Boolean,
    default : false
  }
}, { timestamps: true });

/******************** Password HASHING ********************/
userSchema.pre("save", async function (next) {
  if (!this.isModified("Password"));

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);

});

/******************** GENERATE JWT TOKEN ********************/
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
      fullname: this.fullname,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRED_TIME || "1d" }
  );
};

/******************** COMPARE Password ********************/
userSchema.methods.comparePassword = function (Password) {
  return bcrypt.compare(Password, this.Password);
};

export const User = mongoose.model("User", userSchema);
