import Nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const transporter = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
    testInboxId: process.env.MAILTRAP_ACCOUNT_ID,
  })
);

export const sender = {
  address: "fordev2024@gmail.com",
  name: "DevAgency",
};

