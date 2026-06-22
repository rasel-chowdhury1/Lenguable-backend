"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const config_1 = require("../config");
const handlerDuplicateError_1 = require("../helpers/handlerDuplicateError");
const handleCastError_1 = require("../helpers/handleCastError");
const handlerZodError_1 = require("../helpers/handlerZodError");
const handlerValidationError_1 = require("../helpers/handlerValidationError");
const AppError_1 = __importDefault(require("../helpers/AppError"));
const globalErrorHandler = (err, req, res, next) => {
    if (config_1.envVars.NODE_ENV === "development") {
        console.error('Error Details:', {
            name: err === null || err === void 0 ? void 0 : err.name,
            message: err === null || err === void 0 ? void 0 : err.message,
            code: err === null || err === void 0 ? void 0 : err.code,
            statusCode: err === null || err === void 0 ? void 0 : err.statusCode,
            stack: err === null || err === void 0 ? void 0 : err.stack,
        });
    }
    let errorSources = [];
    let statusCode = 500;
    let message = "Something Went Wrong!!";
    //Duplicate error
    if (err.code === 11000) {
        const simplifiedError = (0, handlerDuplicateError_1.handlerDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Object ID error / Cast Error
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    else if (err.name === "ZodError") {
        const simplifiedError = (0, handlerZodError_1.handlerZodError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    //Mongoose Validation Error
    else if (err.name === "ValidationError") {
        const simplifiedError = (0, handlerValidationError_1.handlerValidationError)(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources;
        message = simplifiedError.message;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: config_1.envVars.NODE_ENV === "development" ? err : null,
        stack: config_1.envVars.NODE_ENV === "development" ? err.stack : null
    });
};
exports.globalErrorHandler = globalErrorHandler;
