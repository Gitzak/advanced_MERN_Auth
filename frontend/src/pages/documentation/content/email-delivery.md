Mailtrap Sandbox captures development messages so verification and recovery can be tested without delivering to real recipients. The application uses standard SMTP credentials with Nodemailer, not the Mailtrap HTTP API.

## Configure the sandbox

Open your Mailtrap Sandbox inbox and copy its SMTP settings into the backend environment file:

```dotenv
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-sandbox-username
SMTP_PASS=your-sandbox-password
EMAIL_FROM="Data App Dev <from@example.com>"
```

Use credentials from the same inbox. Restart the backend after editing them. View captured messages in Mailtrap, including when the form uses your own real email address.

## Delivery lifecycle

```text
Account operation
  → EmailJob persisted with message content
  → HTTP response returns
  → worker claims a pending job
  → Nodemailer submits it to SMTP
  → job marked sent; recipient and HTML removed
```

The worker starts with the API and checks the queue every **five seconds**. It processes up to **ten jobs per pass**, prevents overlapping passes inside one process and claims each job with a **60-second lock**.

SMTP failures retry with exponential backoff capped at five minutes. A job becomes `failed` after **five attempts**. Jobs have a **one-day expiry**; MongoDB's TTL cleanup is asynchronous.

## Message types

| Trigger | Message |
| --- | --- |
| Registration or code resend | Six-digit verification code. |
| Successful verification | Welcome message. |
| Password recovery request | One-hour reset link. |
| Password reset or change | Password success notification. |
| Email change request | Confirmation link to the new address and notice to the old address. |
| Email change confirmation | Success message to the new address. |

Templates live in `backend/utils/emailTemplates.js`. Composition helpers are in `backend/utils/emails.js`; sender branding is configurable through `EMAIL_FROM`. The default template copy can be edited there if you want all email text to use Data App branding.

## Failure semantics

An SMTP delivery failure does not roll back a completed password change or account verification. Delivery stays pending for retry. A successful HTTP response means the business operation and queue persistence completed; it does not promise the recipient has already opened a delivered email.

Database failures while creating a job can still fail a request after an account change was saved, because these operations do not use a database transaction. Check the actual account state before retrying a sensitive operation after an ambiguous failure.

There is also a small duplicate-delivery window if the process stops after SMTP accepts a message but before the job is marked sent. Treat notifications as at-least-once delivery.

## Inspect the queue safely

In the intended development database, use a projection that avoids printing recipient addresses, codes or links:

```javascript
// MongoDB shell
db.emailjobs.find(
  { status: "pending" },
  { _id: 1, status: 1, attempts: 1, nextAttemptAt: 1 }
);
```

Pending HTML contains live verification or recovery secrets until it is sent or expires. Limit database access and do not copy queue payloads into logs, screenshots or public bug reports.
