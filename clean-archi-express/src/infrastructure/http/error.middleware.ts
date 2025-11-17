import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error =
    err instanceof Error
      ? err
      : new Error(typeof err === "string" ? err : "Unknown error");

  req.logger.error("Unhandled application error", {
    context: "ExpressError",
    method: req.method,
    path: req.originalUrl,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    message: "Internal server error",
  });
}
