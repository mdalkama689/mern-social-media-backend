const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

function validateEmail(email, next) {
  try {
    if (!email) {
      return next({
        statusCode: 400,
        message: "Please enter the email",
      });
    }

    if (!emailRegex.test(email)) {
      return next({
        statusCode: 400,
        message: "Please enter a valid email",
      });
    } else {
      console.log("Email is valid");
    }
  } catch (error) {
    throw new Error(`Error in validate email: ${error.message}`);
  }
}
export default validateEmail;
