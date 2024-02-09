function validateAge(dateOfBirth, next) {
  try {
    const currentDate = new Date();

    if (!dateOfBirth) {
      return next({
        statusCode: 400,
        message: "Please entre the date of  birth",
      });
    }

    const userDateOfBirth = new Date(dateOfBirth);

    if (userDateOfBirth > currentDate) {
      return next({
        statusCode: 400,
        message: "Date of birth cannot be in the future",
      });
    }

    const minAge = new Date(currentDate);
    minAge.setFullYear(currentDate.getFullYear() - 5);

    if (userDateOfBirth > minAge) {
      return next({
        statusCode: 400,
        message: "We don't allow kids. Age must be more than 5 years",
      });
    }
  } catch (error) {
    throw new Error(`Error in validate age: ${error.message}`);
  }
}

export default validateAge;
