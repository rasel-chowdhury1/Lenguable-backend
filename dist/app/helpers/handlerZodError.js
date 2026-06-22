"use strict";
// import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types"
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerZodError = void 0;
const handlerZodError = (err) => {
    var _a;
    const errorSources = [];
    err.issues.forEach((issue) => {
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        });
    });
    const message = ((_a = errorSources[0]) === null || _a === void 0 ? void 0 : _a.message) || "Validation Error";
    return {
        statusCode: 400,
        message,
        errorSources,
    };
};
exports.handlerZodError = handlerZodError;
