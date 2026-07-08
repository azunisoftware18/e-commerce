import jwt from "jsonwebtoken";

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Token nahi hai to bhi request continue hogi
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
    // Invalid token ho to bhi request continue hogi
    req.user = null;
    next();
  }
};

export { optionalAuthMiddleware };