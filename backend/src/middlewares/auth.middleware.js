import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { cookieOptions } from "../utils/utils.js";

const authMiddleware = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return ApiError.send(res, 401, "Access token is missing or invalid.");
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return ApiError.send(res, 401, "Invalid token. Unauthorized access.");
    }

    const { password, ...userWithoutPassword } = decoded;

    req.user = userWithoutPassword;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    res.clearCookie("accessToken", cookieOptions);
    return ApiError.send(res, 401, "Session expired. Please sign in again.");
  }
};

export { authMiddleware };
