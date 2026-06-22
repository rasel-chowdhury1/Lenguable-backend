import { Response } from "express";
import { envVars } from "../config";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const isProduction = envVars.NODE_ENV === "production"; 

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
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
