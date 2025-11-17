var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PinoAppLogger_1;
import { injectable, registry } from "tsyringe";
import { createBasePinoLogger } from "./pinoConfig.js";
import { TOKENS } from "../../infrastructure/di/tokens.js";
/**
 * App Logger used to log business
 */
let PinoAppLogger = PinoAppLogger_1 = class PinoAppLogger {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    static createRoot() {
        const base = createBasePinoLogger();
        return new PinoAppLogger_1(base);
    }
    child(bindings) {
        const childLogger = this.logger.child(bindings);
        return new PinoAppLogger_1(childLogger);
    }
    debug(message, meta) {
        this.logger.debug(meta ?? {}, message);
    }
    info(message, meta) {
        this.logger.info(meta ?? {}, message);
    }
    warn(message, meta) {
        this.logger.warn(meta ?? {}, message);
    }
    error(message, meta) {
        this.logger.error(meta ?? {}, message);
    }
};
PinoAppLogger = PinoAppLogger_1 = __decorate([
    registry([
        {
            token: TOKENS.Logger,
            useFactory: () => PinoAppLogger.createRoot(),
        },
    ]),
    injectable(),
    __metadata("design:paramtypes", [Object])
], PinoAppLogger);
export { PinoAppLogger };
