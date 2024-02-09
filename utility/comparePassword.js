import bcrypt from "bcrypt";

async function comparePassword(userInputPassword, storedPassword) {
  try {
    return await bcrypt.compare(userInputPassword, storedPassword);
  } catch (error) {
    throw new Error(`Error comparing password: ${error.message}`);
  }
}
export default comparePassword;
