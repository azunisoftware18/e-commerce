import jwt from "jsonwebtoken";

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Continue the request when no token is present.
    if (!accessToken) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const { password, ...userWithoutPassword } = decoded;

    req.user = userWithoutPassword;

    next();
  } catch (error) {
    // Continue the request when the token is invalid.
    req.user = null;
    next();
  }
};

export { optionalAuthMiddleware };
