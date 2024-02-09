import mongoose, { Schema, model } from "mongoose";

// userSchema
const userSchema = new Schema(
  {
    fullName: {
      type: String,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
    },
    newEmail: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Female", "Male", "Other"],
      required: [true, "Gender is required"],
    },
    isEmailExists: {
      type: Boolean,
      default: false,
    },
    isUserNameExists: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    forgotPasswordOtp: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    isForgotPasswordOtpUsed: {
      type: Boolean,
      default: false,
    },
    changeEmailOtp: {
      type: String,
    },
    isChangeEmailOtpUsed: {
      type: Boolean,
      default: false,
    },
    changeEmailOtpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
