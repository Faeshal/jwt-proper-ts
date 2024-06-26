import { Request, Response, NextFunction } from "express";
import log4js from "log4js";
const log = log4js.getLogger("middleware:errorHandler");

class ErrorResponse extends Error {
  public statusCode: number;
  public message: string;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.info("errorHandler:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    data: null,
  });
};

export { ErrorResponse, errorHandler };
