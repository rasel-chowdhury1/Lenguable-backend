import nodemailer from "nodemailer";
import { envVars } from "../config";
import AppError from "../helpers/AppError";
import { templates } from "./emailTemplates";

const transporter = nodemailer.createTransport({
  host: envVars.SMTP_HOST,
  port: Number(envVars.SMTP_PORT),
  secure: true,
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const renderTemplate = templates[templateName];

    
    if (!renderTemplate) {
      throw new AppError(500, `Email template "${templateName}" not found`);
    }

    const html = renderTemplate(templateData ?? {});

    const info = await transporter.sendMail({
      from: envVars.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log("email sending error", error.message);
    throw new AppError(401, "Email error");
  }
};
