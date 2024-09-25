import Nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const transporter = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
    testInboxId: 3131333,
  })
);

export const sender = {
  address: "fordev2024@gmail.com",
  name: "DevAgency",
};

