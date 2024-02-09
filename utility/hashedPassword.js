import bcrypt from 'bcrypt'

async function hashedPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`)
  }
}
export default hashedPassword