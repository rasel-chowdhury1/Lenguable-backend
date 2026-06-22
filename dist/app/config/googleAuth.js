"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
// Load refresh token from env
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
// Auto-save new tokens if they rotate
oauth2Client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
        console.log("New refresh token:", tokens.refresh_token);
    }
});
exports.default = oauth2Client;
