import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import apiResponse from "../utils/ApiResponse";

const JWT_SECRET = process.env.JWT_SECRET || "BoostEngineIsFutureStickCompany";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return apiResponse(res, 401, false, "Access Denied : no token provided");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return apiResponse(res, 401, false, "Invalid or expired Token");
  }
};

export default authMiddleware;
