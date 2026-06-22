import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

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

export default oauth2Client;
