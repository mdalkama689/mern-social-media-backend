import bcrypt from "bcrypt";

async function compareOtp(userInputOtp, storedOtp) {
  try {
    return await bcrypt.compare(userInputOtp, storedOtp);
  } catch (error) {
    throw new Error(`Error comparing otp: ${error.message}`);
  }
}

export default compareOtp;
