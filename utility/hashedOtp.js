import bcrypt from "bcrypt";

async function hashedOtp(otp) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
  } catch (error) {
    throw new Error(`Error hashing otp: ${error.message}`);
  }
}

export default hashedOtp;
