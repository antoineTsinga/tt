import express from "express";
import { container } from "tsyringe";
import { TOKENS } from "./di/tokens.js";
import { attachRequestLogger } from "./http/request-logger.middleware.js";
import { errorMiddleware } from "./http/error.middleware.js";
import { setupGlobalErrorHandlers } from "../core/logging/setupGlobalErrorHandlers.js";
import { printStartupCli } from "../core/cli/startupBanner.js";
export async function startHttp(port = 3000) {
    const bootStart = Date.now();
    // 1. Handlers globaux
    setupGlobalErrorHandlers();
    const app = express();
    app.set("trust proxy", true);
    // 2. HTTP logging
    const httpRequestLogger = container.resolve(TOKENS.HttpRequestLogger);
    app.use(httpRequestLogger.getMiddleware());
    // 3. Logger par requête
    app.use(attachRequestLogger);
    // 4. Body parsing
    app.use(express.json());
    // 5. Routes
    app.get("/", (req, res) => {
        req.logger.info("Handling root route", { context: "RootHandler" });
        res.send("OK");
    });
    app.get("/error", (req, res) => {
        throw new Error("Simulated error for testing purposes");
    });
    // 6. Middleware d’erreur
    app.use(errorMiddleware);
    // 7. Démarrage du serveur
    const appLogger = container.resolve(TOKENS.Logger);
    const env = process.env.NODE_ENV || "development";
    const host = process.env.HOST || "localhost";
    const appName = process.env.APP_NAME || "My Awesome API";
    const version = process.env.APP_VERSION || "1.0.0";
    app.listen(port, () => {
        const bootTimeMs = Date.now() - bootStart;
        // Log technique via ILogger
        appLogger.info("Server listening", {
            context: "Bootstrap",
            port,
            env,
            host,
            bootTimeMs,
        });
        // Banner CLI friendly
        printStartupCli({
            appName,
            version,
            env,
            port,
            host,
            bootTimeMs,
        });
    });
}
