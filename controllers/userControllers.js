import Error from "../middlewares/errorHandler.js";
import User from "../models/user.js";
import otpGenerate from "../utility/otpGenerate.js";
import sendEmail from "../utility/sendEmail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateOTP from "../utility/otpGenerate.js";
import maskEmail from "../utility/maskEmail.js";
import { config } from "dotenv";
import validateEmail from "../utility/validateEmail.js";
import validatePassword from "../utility/validatePassword.js";
import validateAge from "../utility/validateAge.js";
import validateFullName from "../utility/validateFullName.js";
import validUserName from "../utility/validUserName.js";
import hashedOtp from "../utility/hashedOtp.js";
import hashedPassword from "../utility/hashedPassword.js";
import compareOtp from "../utility/compareOtp.js";
import comparePassword from "../utility/comparePassword.js";
config();

const secretKey = process.env.SECRET_KEY;

const signup = async (req, res, next) => {
  const { fullName, userName, email, password, dateOfBirth, gender } = req.body;
  try {
    if (
      !fullName ||
      !userName ||
      !email ||
      !password ||
      !dateOfBirth ||
      !gender
    ) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }

    validateFullName(fullName, next);
    validUserName(userName, next);
    validateEmail(email, next);
    validatePassword(password, next);
    validateAge(dateOfBirth, next);

    // password should not be same as full name and email
    if (password.toLowerCase() === fullName.toLowerCase()) {
      return next({
        statusCode: 400,
        message: "Password cannot be same as fullname",
      });
    }

    if (password.toLowerCase() === email.toLowerCase()) {
      return next({
        statusCode: 400,
        message: "Password cannot be same as email",
      });
    }

    let userExists = await User.findOne({ email });
    // check email and username already exists  or not
    if (userExists && userExists.isEmailExists) {
      return next({
        statusCode: 409,
        message: "Email already exists",
      });
    }

    if (userExists && userExists.isUserNameExists) {
      return next({
        statusCode: 400,
        message: "Username already exists",
      });
    }
    // generate and hashed otp
    const otp = otpGenerate();
    await sendEmail(email, otp, "signup");
    console.log(`OTP : ${otp}`);
    if (!userExists) {
      // save data in db
      userExists = await User.create({
        fullName,
        userName,
        email,
        password: await hashedPassword(password),
        dateOfBirth,
        gender,
        otp: await hashedOtp(otp),
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
      });
    } else {
      (userExists.otp = await hashedOtp(otp)),
        (userExists.otpExpiry = new Date(Date.now() + 5 * 60 * 1000));
    }
    await userExists.save();
    userExists.otp = undefined;
    userExists.otpExpiry = undefined;
    userExists.password = undefined;
    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${maskEmail(email)}`,
      userExists,
    });
  } catch (error) {
    console.error("Error creating new account:", error.message);
    return next({
      statusCode: 400,
      message: error.message || "Error creating new account:",
    });
  }
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }

    if (otp.length !== 6) {
      return next({
        statusCode: 400,
        message: "Please enter 6 digits",
      });
    }
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return next({
        statusCode: 409,
        message: "User does not exist",
      });
    }
    // check email and username exists or not
    if (userExists && userExists.isEmailExists) {
      return next({
        statusCode: 400,
        message: "Email already exists",
      });
    }
    if (userExists && userExists.isUserNameExists) {
      return next({
        statusCode: 400,
        message: "Username already exists",
      });
    }
    console.log(userExists);
    //  verify otp

    const isValidOtp = await compareOtp(otp, userExists.otp);
    console.log(isValidOtp);
    if (isValidOtp && userExists.otpExpiry > new Date()) {
      userExists.otp = undefined;
      userExists.otpExpiry = undefined;
      userExists.isEmailExists = true;
      userExists.isUserNameExists = true;
      await userExists.save();
      userExists.password = undefined;
      return res.status(200).json({
        success: true,
        message: "OTP verification successfully",
        userExists,
      });
    } else {
      return next({
        statusCode: 400,
        message: "Invalid otp",
      });
    }
  } catch (error) {
    console.log(`Error during verifying otp ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during verifying OTP",
    });
  }
};

const login = async (req, res, next) => {
  // get email or username from the user
  const { userIdendifier, password } = req.body;

  try {
    if (!userIdendifier || !password) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }

    const userExists = await User.findOne({
      $or: [{ email: userIdendifier }, { userName: userIdendifier }],
    }).select("+password");
    console.log(userExists);
    if (!userExists) {
      return next({
        statusCode: 409,
        message: " User does not exist",
      });
    }
    // check password
    const isPasswordCorrect = await comparePassword(
      password,
      userExists.password
    );
    if (!isPasswordCorrect) {
      return next({
        statusCode: 401,
        message: /^\S+@\S+\.\S+$/.test(userIdendifier)
          ? "Email or password is incorrect"
          : "Username or password is incorrect",
      });
    }
    // generate a token
    const payload = {
      _id: userExists.id,
      userName: userExists.userName,
      fullName: userExists.fullName,
      dateOfBirth: userExists.dateOfBirth,
      gender: userExists.gender,
      email: userExists.email,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });

    userExists.password = undefined;
    return res.status(200).json({
      success: true,
      message: "User login successfully",
      Token: token,
      userExists,
    });
  } catch (error) {
    console.log(`Error during login ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during login",
    });
  }
};

// need to work
const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, null);
    return res.status(200).json({
      success: true,
      message: "User logout successfully",
    });
  } catch (error) {
    console.log(`Error during logout ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during logout",
    });
  }
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }
    if (newPassword !== confirmPassword) {
      return next({
        statusCode: 400,
        message: "New password and confirm password do not match",
      });
    }
    validatePassword(newPassword, next);
    // check userexists cor not  and get user password only
    const userExists = await User.findById(req.user._id).select("+password");
    console.log(userExists);
    if (!userExists) {
      return next({
        statusCode: 409,
        message: " User does not exists",
      });
    }
    // check password
    const isPasswordCorrect = await comparePassword(
      oldPassword,
      userExists.password
    );
    console.log(
      `new password ; ${newPassword} and confirm password : ${confirmPassword}`
    );
    console.log(`is password correct : ${isPasswordCorrect}`);
    // if password is correct then change their password
    if (isPasswordCorrect) {
      userExists.password = await hashedPassword(newPassword);
      await userExists.save();
      userExists.password = undefined;
      return res.status(200).json({
        success: true,
        message: "Password change successfully",
        userExists,
      });
    } else {
      return next({
        statusCode: 400,
        message: "Please enter correct password",
      });
    }
  } catch (error) {
    console.log(`Error during change password ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during change password",
    });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return next({
        statusCode: 409,
        message: "User does not exists",
      });
    }
    // generate, hashed and send otp to their email
    const otp = generateOTP();
    console.log(otp);
    await sendEmail(email, otp, "forgotPassword");
    const hashedOTP = await hashedOtp(otp);
    userExists.forgotPasswordOtp = hashedOTP;
    userExists.forgotPasswordExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await userExists.save();
    return res.status(200).json({
      success: true,
      message: `OTP has been sent to your email: ${maskEmail(
        email
      )}. Please check your email to proceed.`,
      userExists,
    });
  } catch (error) {
    console.log(`Error during forgot password ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during forgot password",
    });
  }
};

const verifyOtpForForgotPassword = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }
    const userExists = await User.findOne({ email });

    if (otp.length !== 6) {
      return next({
        statusCode: 400,
        message: "Please enter 6 digits otp",
      });
    }
    if (!userExists) {
      return next({
        statusCode: 409,
        message: "User does not exists",
      });
    }
    // verify otp
    const isValidOtp = await compareOtp(otp, userExists.forgotPasswordOtp);
    if (isValidOtp && userExists.forgotPasswordExpiry > new Date()) {
      userExists.forgotPasswordOtp = undefined;
      userExists.forgotPasswordExpiry = undefined;
      userExists.isForgotPasswordOtpUsed = true;
      await userExists.save();
      userExists.password = undefined;
      return res.status(200).json({
        success: true,
        message: "Verification succussfully for forgot the password",
        userExists,
      });
    } else {
      return next({
        statusCode: 400,
        message: "Invalid otp",
      });
    }
  } catch (error) {
    console.log(
      `Error during verify OTP for change/reset password: ${error.message}`
    );
    return next({
      statusCode: 400,
      message:
        error.message || "Error during verify OTP for change/reset password",
    });
  }
};

const resetPassword = async (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    if (!email || !newPassword || !confirmPassword) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return next({
        statusCode: 404,
        message: "User does not exists",
      });
    }

    if (newPassword !== confirmPassword) {
      return next({
        statusCode: 400,
        message: "New password and confirm password do not match",
      });
    }
    if (userExists && userExists.isForgotPasswordOtpUsed) {
      userExists.password = await hashedPassword(newPassword);
      userExists.isForgotPasswordOtpUsed = false;
      await userExists.save();
      userExists.password = undefined;
      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
        userExists,
      });
    } else {
      return next({
        statusCode: 400,
        message: "Please enter your forgot password otp!",
      });
    }
  } catch (error) {
    console.log(`Error during reset password ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during reset password",
    });
  }
};

const requestEmailChange = async (req, res, next) => {
  const { existingEmail, newEmail, confirmNewEmail } = req.body;
  try {
    if (!existingEmail || !newEmail || !confirmNewEmail) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }
    if (newEmail != confirmNewEmail) {
      return next({
        statusCode: 404,
        message: "New email and confirm new email do not match",
      });
    }
    const userExists = await User.findById(req.user._id);
    if (userExists.email !== existingEmail) {
      return next({
        statusCode: 404,
        message: "Please enter correct old email",
      });
    }
    if (!userExists) {
      return next({
        statusCode: 409,
        message: "User does not exists",
      });
    }

    // generate and send otp to their email

    const otp = generateOTP();
    console.log(otp);
    await sendEmail(existingEmail, otp, "sendOtpOnexistingEmail");
    const hashedOTP = await hashedOtp(otp);
    userExists.changeEmailOtp = hashedOTP;
    userExists.changeEmailOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    userExists.newEmail = newEmail;
    await userExists.save();
    return res.status(200).json({
      success: true,
      message: `OTP has been sent to : ${maskEmail(
        existingEmail
      )}. Please check your email to proceed.`,
      userExists,
    });
  } catch (error) {
    console.log(
      `Error during generate otp for change the email ${error.message}`
    );
    return next({
      statusCode: 400,
      message:
        error.message || "Error during generate otp for change the email",
    });
  }
};

const verifyOtpAndChangeEmail = async (req, res, next) => {
  const { existingEmail, newEmail, otp } = req.body;
  try {
    if (!existingEmail || !otp || !newEmail) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }
    const userExists = await User.findById(req.user._id);
    if (otp.length !== 6) {
      return next({
        statusCode: 400,
        message: "Please enter 6 digits otp",
      });
    }
    if (!userExists) {
      return next({
        statusCode: 404,
        message: "User does not exists",
      });
    }
    if (userExists.email !== existingEmail) {
      return next({
        statusCode: 404,
        message: "Please enter correct existing email",
      });
    }
    if (userExists.newEmail !== newEmail) {
      return next({
        statusCode: 404,
        message: "Please enter correct new email",
      });
    }
    // verify otp and change and save email in db
    const isValidOtp = await compareOtp(otp, userExists.changeEmailOtp);
    if (isValidOtp && userExists.changeEmailOtpExpiry > new Date()) {
      userExists.changeEmailOtp = undefined;
      userExists.changeEmailOtpExpiry = undefined;
      userExists.isChangeEmailOtpUsed = true;
      const newOtp = generateOTP();
      console.log(newOtp);
      await sendEmail(newEmail, otp, "sendOtpOnNewEmail");
      const hashedOTP = await hashedOtp(newOtp);
      userExists.changeEmailOtp = hashedOTP;
      userExists.changeEmailOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await userExists.save();
      userExists.password = undefined;
      return res.status(200).json({
        success: true,
        message: `OTP verification successfully for change the email and send OTP to your new email ${maskEmail(
          newEmail
        )}`,
        userExists,
      });
    } else {
      return next({
        statusCode: 400,
        message: "Invalid otp",
      });
    }
  } catch (error) {
    console.log(`Error during change email ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during change email",
    });
  }
};

const finalizeEmailChange = async (req, res, next) => {
  const { newEmail, otp } = req.body;

  try {
    if (!newEmail || !otp) {
      return next({
        statusCode: 404,
        message: "Please fill in all required fields",
      });
    }

    if (otp.length !== 6) {
      return next({
        statusCode: 400,
        message: "Please enter 6 digits otp",
      });
    }
    const userExists = await User.findById(req.user._id);

    if (!userExists) {
      return next({
        statusCode: 404,
        message: "User does not exists",
      });
    }
    if (!userExists.isChangeEmailOtpUsed) {
      return next({
        statusCode: 404,
        message: "Unauthorized routes",
      });
    }
    // verify otp and change and save email in db
    const isValidOtp = await compareOtp(otp, userExists.changeEmailOtp);
    console.log(isValidOtp);
    if (
      isValidOtp &&
      userExists.changeEmailOtpExpiry > new Date() &&
      userExists.isChangeEmailOtpUsed
    ) {
      userExists.changeEmailOtp = undefined;
      userExists.email = newEmail;
      userExists.changeEmailOtpExpiry = undefined;
      userExists.isChangeEmailOtpUsed = false;
      userExists.newEmail = undefined;
      await userExists.save();
      userExists.password = undefined;
      return res.status(200).json({
        success: true,
        message: `OTP verification successfully and changed your email`,
        userExists,
      });
    } else if (!isValidOtp) {
      return next({
        statusCode: 400,
        message: "Invalid otp",
      });
    }
  } catch (error) {
    console.log(`Error during change email ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during change email",
    });
  }
};

const changePersonalInfo = async (req, res, next) => {
  try {
    const userExists = await User.findById(req.user._id);

    if (!userExists) {
      return next({
        statusCode: 409,
        message: "User does not exists",
      });
    }
    if (Object.keys(req.body).length === 0) {
      return next({
        statusCode: 400,
        message: "No data provide for update",
      });
    }
    if (
      req.body.gender &&
      ["Female", "Male", "Other"].includes(req.body.gender)
    ) {
      userExists.gender = req.body.gender;
    }

    if (req.body.dateOfBirth) {
      validateAge(req.body.dateOfBirth, next);
    }
    await userExists.save();
    let message = "";

    if (req.body.gender && req.body.dateOfBirth) {
      message = "Gender and date of birth updated successfully";
    } else if (req.body.gender) {
      message = "Gender updated successfully";
    } else if (req.body.dateOfBirth) {
      message = "Date of birth updated successfully";
    }
    userExists.password = undefined;
    return res.status(200).json({
      success: true,
      message: message,
      userExists,
    });
  } catch (error) {
    console.log(`Error during change personal info ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during change personal info",
    });
  }
};

const getProfileDetails = async (req, res, next) => {
  try {
    const userExists = await User.findById(req.user._id);

    if (!userExists) {
      return next({
        statusCode: 404,
        message: "User does not exists",
      });
    }
    userExists.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      userExists,
    });
  } catch (error) {
    console.log(`Error during retrieved user profile : ${error.message}`);
    return next({
      statusCode: 400,
      message: error.message || "Error during retrieved user profile",
    });
  }
};

export {
  signup,
  verifyOtp,
  login,
  logout,
  changePassword,
  forgotPassword,
  verifyOtpForForgotPassword,
  resetPassword,
  requestEmailChange,
  verifyOtpAndChangeEmail,
  finalizeEmailChange,
  changePersonalInfo,
  getProfileDetails,
};
