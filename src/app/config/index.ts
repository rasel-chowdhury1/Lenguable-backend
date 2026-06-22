import dotenv from "dotenv";

dotenv.config();

export const envVars = {
  IP: process.env.IP as string,
  PORT: process.env.PORT as string,
  DB_URL: process.env.DB_URL as string,
  NODE_ENV: process.env.NODE_ENV as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRED as string,
  BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  UPLOAD_URL: process.env.UPLOAD_URL as string,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_PORT: process.env.SMTP_PORT as string,
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,
  SMTP_FROM: process.env.SMTP_FROM as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: process.env.REDIS_PORT as string,
  REDIS_USERNAME: process.env.REDIS_USERNAME as string,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
  BACKEND_URL: process.env.BACKEND_URL as string,
};
