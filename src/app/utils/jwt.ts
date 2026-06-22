import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export const generateToken = (payload: JwtPayload, secret: string, expiresIn: string) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: "30d",
    })
    return token;
}

export const verifyToken = (token: string, secret: string) => {
    const verifiedToken = jwt.verify(token, secret);
    return verifiedToken
}