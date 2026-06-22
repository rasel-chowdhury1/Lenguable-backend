import nodemailer from 'nodemailer';
import { envVars } from '../config';


const isProduction = process.env.NODE_ENV === 'production';

// console.log(" isProduction:", isProduction);
// console.log(" config.smtp.host:", config.smtp.host);
// console.log(" config.smtp.user:", config.smtp.user);
// console.log(" config.smtp.pass:", config.smtp.pass);

const transporter = nodemailer.createTransport({
  host: envVars.SMTP_HOST, // sending SMTP server
  port: isProduction ? 465 : 587,             // SSL port
  secure: isProduction,           // true for port 465
  auth: {
    user: envVars.SMTP_USER,        // webmail email
    pass: envVars.SMTP_PASS   // SMTP/webmail password
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP connection failed', err);
  } else {
    console.log('SMTP is ready to send mail');
  }
});  


export const sendEmail = async (to: string, subject: string, html: string) => {



  try {
     console.log('mail send started =>>>>>>>>> ');
    await transporter.sendMail({
      from: `"${envVars.SMTP_FROM}" <${envVars.SMTP_USER}>`, // sender address
      to, // list of receivers
      subject,
      html, // html body
    });

    console.log('mail sended successfully =>>>>>>>> ');
    
  } catch (error) {
    console.log('send mail error:', error);
    
  }
  console.log('mail sended stopped');
};


