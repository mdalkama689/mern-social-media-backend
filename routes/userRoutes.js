import express from "express";
import {
  changePassword,
  changePersonalInfo,
  finalizeEmailChange,
  forgotPassword,
  getProfileDetails,
  login,
  logout,
  requestEmailChange,
  resetPassword,
  signup,
  verifyOtp,
  verifyOtpAndChangeEmail,
  verifyOtpForForgotPassword,
} from "../controllers/userControllers.js";
import authenticateUserMiddleware from "../middlewares/authenticateUserMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.put("/change-password", authenticateUserMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/forgot-password", verifyOtpForForgotPassword);
router.post("/reset-password", resetPassword);
router.post(
  "/request-email-change",
  authenticateUserMiddleware,
  requestEmailChange
);
router.post(
  "/verify-otp-and-change-email",
  authenticateUserMiddleware,
  verifyOtpAndChangeEmail
);
router.post(
  "/finalize-email-change",
  authenticateUserMiddleware,
  finalizeEmailChange
);
router.put(
  "/change-personal-info",
  authenticateUserMiddleware,
  changePersonalInfo
);
router.get("/me", authenticateUserMiddleware, getProfileDetails);
export default router;
