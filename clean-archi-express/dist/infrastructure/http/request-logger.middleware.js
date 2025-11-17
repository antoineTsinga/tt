import { container } from "tsyringe";
import { TOKENS } from "../di/tokens.js";
export function attachRequestLogger(req, res, next) {
    const baseLogger = container.resolve(TOKENS.Logger);
    const requestId = req.id; // fourni par pino-http à l’exécution
    req.logger = baseLogger.child({
        requestId,
        path: req.originalUrl ?? req.url,
        context: "APP",
    });
    next();
}
