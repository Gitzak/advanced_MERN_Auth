import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
  testInboxId: 3131333,
  accountId : process.env.MAILTRAP_ACCOUNT_ID
});

export const sender = {
  email: "fordev2024@gmail.com",
  name: "DevAgency",
};

// const recipients = [
//   {
//     email: "fordev2024@gmail.com",
//   },
// ];

// mailtrapClient.testing
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
