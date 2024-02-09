import jwt from "jsonwebtoken";

// user authorization
const authenticateUserMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return next({
        statusCode: 401,
        message: "Unauthenticated, please login to continue",
      });
    }
    const userDetails = await jwt.verify(token, process.env.SECRET_KEY);
    req.user = userDetails;
    next();
  } catch (error) {
    return next({
      statusCode: 400,
      message: error.message || "Internal server error",
    });
  }
};

export default authenticateUserMiddleware;
