"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const config_1 = require("../config");
const setAuthCookie = (res, tokenInfo) => {
    const isProduction = config_1.envVars.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        domain: isProduction ? ".lenguable.com" : undefined,
    };
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, cookieOptions);
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, cookieOptions);
    }
};
exports.setAuthCookie = setAuthCookie;
