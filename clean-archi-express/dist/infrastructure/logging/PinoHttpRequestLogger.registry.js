var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable, registry } from "tsyringe";
import { pinoHttp } from "pino-http";
import { randomUUID } from "crypto";
import { createBasePinoLogger } from "./pinoConfig.js";
import { TOKENS } from "../../infrastructure/di/tokens.js";
let PinoHttpRequestLogger = class PinoHttpRequestLogger {
    middleware;
    constructor() {
        const logger = createBasePinoLogger();
        this.middleware = pinoHttp({
            logger,
            genReqId: this.genReqId,
            customReceivedMessage: this.customReceivedMessage,
            customSuccessMessage: this.customSuccessMessage,
            customErrorMessage: this.customErrorMessage,
            serializers: {
                req: () => undefined,
                res: () => undefined,
                responseTime: () => undefined,
            },
            customLogLevel: function (req, res, err) {
                if (res.statusCode >= 400 && res.statusCode < 500) {
                    return "warn";
                }
                else if (res.statusCode >= 500 || err) {
                    return "error";
                }
                return "info";
            },
        });
    }
    getMiddleware() {
        return this.middleware;
    }
    // ---------- Private helpers ----------
    genReqId(req, res) {
        const existing = req.id || req.headers["x-request-id"];
        if (existing && typeof existing === "string") {
            return existing;
        }
        const id = randomUUID().slice(0, 8); // 07738a81
        res.setHeader("X-Request-Id", id);
        return id;
    }
    customReceivedMessage(req, res) {
        // on stocke un startAt haute résolution sur la requête
        const reqAny = req;
        reqAny._startAt = process.hrtime.bigint();
        const ip = req.ip ||
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "-";
        const path = req.originalUrl || req.url;
        const ts = new Date().toISOString();
        // pino-http rajoutera le niveau etc., ici on se consacre au message
        return `(#${reqAny.id}) Started ${req.method} ${path} for ${ip}`;
    }
    customSuccessMessage(req, res) {
        const reqAny = req;
        const end = process.hrtime.bigint();
        const start = reqAny._startAt ?? end;
        const diffMs = Number(end - start) / 1e6;
        const length = res.getHeader("content-length") ?? 0;
        return `(#${reqAny.id}) Completed ${res.statusCode} ${length} in ${diffMs.toFixed(3)} ms`;
    }
    customErrorMessage(req, res, err) {
        const reqAny = req;
        const end = process.hrtime.bigint();
        const start = reqAny._startAt ?? end;
        const diffMs = Number(end - start) / 1e6;
        const length = res.getHeader("content-length") ?? 0;
        const ts = new Date().toISOString();
        return `(#${reqAny.id}) Error ${res.statusCode} ${length} in ${diffMs.toFixed(3)} ms - ${err?.message ?? "unknown error"}`;
    }
};
PinoHttpRequestLogger = __decorate([
    registry([
        {
            token: TOKENS.HttpRequestLogger,
            useClass: PinoHttpRequestLogger,
        },
    ]),
    injectable(),
    __metadata("design:paramtypes", [])
], PinoHttpRequestLogger);
export { PinoHttpRequestLogger };
