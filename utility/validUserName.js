function validUserName(userName, next) {
  try {
    if (!userName) {
      return next({
        statusCode: 400,
        message: "Please entre the username",
      });
    }

    if (userName.length < 3 || userName.length > 30) {
      return next({
        statusCode: 400,
        message: "User name should be between 3 and 30 characters",
      });
    } else {
      console.log("Valid username");
    }
  } catch (error) {
    throw new Error(`Error in validate  user name: ${error.message}`);
  }
}

export default validUserName;
