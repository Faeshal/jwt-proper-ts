import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "./errorHandler";
import { verifyToken } from "../utils/jwt";
import log4js from "log4js";
const log = log4js.getLogger("middleware:auth");
log.level = "info";

export const protect = async (req: Request, res: Response, next: any) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new ErrorResponse("unauthorized, token is empty", 401));
    }

    // * verify token
    const decoded: any = await verifyToken(token);
    log.info("DECODED:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    log.error(err);
    return res
      .status(401)
      .json({ success: false, message: "unauthorized or expired token" });
  }
};

export const authorize = (...roles: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(401)
        .json({ success: false, message: "role not authorize" });
    }
    next();
  };
};
