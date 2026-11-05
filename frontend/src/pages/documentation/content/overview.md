Data App is a full-stack account workspace built with **MongoDB, Express, React and Node.js**. It brings the account lifecycle into one place: registration, email verification, sign-in, profile management and account security.

This documentation describes the implementation in this repository. Start with a local installation, then explore the authentication flows and API contracts when you need to extend the application.

## What you can do

| Capability | How it works |
| --- | --- |
| Create an account | Register with a name, email and password. |
| Verify an email | Enter a six-digit, time-limited code from the test inbox. |
| Sign in and stay signed in | Use server-set cookies with a renewable, revocable session. |
| Update your profile | Change your display name from the profile editor. |
| Change your email | Confirm your current password, then approve the link sent to the new address. |
| Recover access | Request a password-reset link without exposing whether an account exists. |
| Manage security | Change the password or delete the account from Account settings. |
| Read project guides | Browse, search and download these Markdown guides from Documentation. |

## The technology stack

**Frontend:** React 19, React Router 7, Vite 8 and Tailwind CSS 4. Formik and Yup handle form state and client validation. Axios carries cookie-authenticated requests, while React Toastify presents operation feedback.

**Backend:** Express 5 and Mongoose 9, with Zod request validation, bcrypt password hashing, JSON Web Tokens, role permissions and request limits. Nodemailer sends messages through SMTP.

**Documentation:** React Markdown renders the local Markdown files. GitHub Flavored Markdown supplies tables and lists; Rehype provides heading anchors and highlighted code examples. No paid service or account is required to read these guides.

## How the pieces connect

```text
Browser · React + Vite
  │  JSON requests + HttpOnly cookies
  ▼
Express API · http://localhost:7500/api
  ├── User records and session validation ── MongoDB
  └── Persisted email jobs ── SMTP worker ── Mailtrap Sandbox
```

The API waits for MongoDB before listening. Once it is running, the application checks the current session before rendering protected pages. The email worker runs inside the backend process and handles delivery independently of the HTTP request.

## Where to begin

1. Follow [Getting started](/documentation/getting-started) to launch both projects.
2. Use [Environment configuration](/documentation/configuration) to connect your own database and SMTP inbox.
3. Read [Authentication and sessions](/documentation/authentication) to understand the account lifecycle.
4. Keep [API reference](/documentation/api-reference) nearby when building a new feature.

> This is a development-oriented application, not a managed identity service. It includes account security controls, but does not currently implement OAuth, passkeys, two-factor authentication, a full admin console or deployment automation.

## Repository map

```text
advanced_MERN_Auth/
├── backend/                 Express application and database models
│   ├── config/              Environment, roles and SMTP transport
│   ├── controllers/         HTTP request and response adapters
│   ├── middleware/          Validation, authentication and limits
│   ├── models/              User, Session and EmailJob
│   ├── repositories/        Shared user queries
│   ├── routes/              API endpoint registration
│   ├── services/            Account lifecycle operations
│   ├── test/                Isolated backend integration tests
│   └── utils/               Cookies, tokens, templates and mail worker
└── frontend/
    └── src/
        ├── api/             Axios client and auth API functions
        ├── components/      Shared UI, logo and sidebar
        ├── context/         Authentication state and actions
        ├── layouts/         Public auth and private workspace layouts
        ├── pages/           Screens and Markdown documentation
        ├── test/            Frontend behavior tests
        └── utils/           Route definitions and guards
```
