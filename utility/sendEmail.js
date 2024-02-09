import nodemailer from "nodemailer";

const sendEmail = async (email, otp, checkCondition) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.YOUR_EMAIL,
      pass: process.env.YOUR_EMAIL_APP_PASSWORD,
    },
  });
  let html;
  let subject;
  if (checkCondition == "signup") {
    subject = `Welcome to The Social Network! Your Verification Code: ${otp}`;
    html = `
  <p>Hi there,</p>
  <p>Welcome to The Social Network! We're excited to have you on board. To complete your registration, please enter the verification code below:</p>
  <h2 style="background-color: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h2>
  <p>This code is valid for the next few minutes. Once verified, you'll be all set to explore and connect with others on our platform.</p>
  <p>Best regards,<br>The Social Network Team</p>
  <p>If you didn't sign up for The Social Network, please ignore this email.</p>
`;
  } else if (checkCondition == "forgotPassword") {
    subject = `Password Reset Code for Your Account`;
    html = `
      <p>Hello,</p>
      <p>We received a request to reset the password for your account. To proceed, please enter the following verification code:</p>
      <h2 style="background-color: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h2>
      <p>If you didn't request a password reset, you can ignore this email.</p>
      <p>Use the code within the next 5 minutes to reset your password securely.</p>
      <p>Best regards,<br>The Support Team</p>
    `;
  } else if (
    checkCondition == "sendOtpOnNewEmail" ||
    checkCondition == "sendOtpOnexistingEmail"
  ) {
    subject = `Email Change OTP - The Social Network`;
    html = `
      <p>Hi,</p>
      <p>We received a request to change the email address associated with your account. If you initiated this request, please enter the following One-Time Password (OTP) in the app:</p>
      <h2 style="background-color: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h2>
      <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
      <p>If you did not request to change your email address, please ignore this email.</p>
      <p>Thank you,</p>
      <p>The Social Network Team</p>
    `;
  }
  const mailOptions = {
    from: process.env.YOUR_EMAIL,
    to: email,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

export default sendEmail;
