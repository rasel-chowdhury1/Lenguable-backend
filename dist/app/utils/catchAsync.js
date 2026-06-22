"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
const config_1 = require("../config");
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (config_1.envVars.NODE_ENV === 'development') // production
            next(err);
    });
};
exports.catchAsync = catchAsync;
