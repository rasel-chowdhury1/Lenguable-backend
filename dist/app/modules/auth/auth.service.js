"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../../helpers/AppError"));
const user_model_1 = require("../user/user.model");
const userToken_1 = require("../../utils/userToken");
const config_1 = require("../../config");
const sendEmail_1 = require("../../utils/sendEmail");
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, timezone } = payload;
    const isUserExist = yield user_model_1.UserModel.findOne({ email: email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email does not exist");
    }
    const isPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Incorrect Password");
    }
    // Save timezone on every login for existing users
    if (timezone) {
        yield user_model_1.UserModel.findByIdAndUpdate(isUserExist._id, { timezone });
    }
    const userTokens = (0, userToken_1.createUserTokens)(isUserExist);
    const _a = isUserExist.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userToken_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
const changePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(decodedToken.userId);
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password does not match");
    }
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(config_1.envVars.BCRYPT_SALT_ROUND));
    user.save();
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.UserModel.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, config_1.envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m",
    });
    const resetUILink = `${config_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgotPassword",
        templateData: {
            name: isUserExist.name,
            resetUILink,
        },
    });
});
const resetPassword = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.id != decodedToken.userId) {
        throw new AppError_1.default(401, "You can not reset your password");
    }
    const isUserExist = yield user_model_1.UserModel.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError_1.default(401, "User does not exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.envVars.BCRYPT_SALT_ROUND));
    isUserExist.password = hashedPassword;
    yield isUserExist.save();
});
exports.AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    forgotPassword,
    resetPassword,
};
