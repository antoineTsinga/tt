export function errorMiddleware(err, req, res, next) {
    const error = err instanceof Error
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
