const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validatePassword(password, next) {
  try {
    if (!password) {
      return next({
        statusCode: 400,
        message: "Plaese enter the password",
      });
    }

    if (!passwordRegex.test(password)) {
      return next({
        statusCode: 400,
        message:
          "Password should contain at least one lowercase letter, one uppercase letter, and one numeric digit.",
      });
    } else {
      console.log("Valid password");
    }
  } catch (error) {
    throw new Error(`Error in validate  password: ${error.message}`);
  }
}

export default validatePassword;
