function validateFullName(fullName, next) {
  try {
    if (!fullName) {
      return next({
        statusCode: 400,
        message: " Please entre full name",
      });
    }

    if (fullName.length < 3 || fullName.length > 30) {
      return next({
        statusCode: 400,
        message: "Full name should be between 3 and 30 characters",
      });
    } else {
      console.log("valid full name");
    }
  } catch (error) {
    throw new Error(`Error in validate full name: ${error.message}`);
  }
}
export default validateFullName;
