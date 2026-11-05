The local base URL is **`http://localhost:7500/api`**. Auth endpoints are under `/auth`. Send JSON for request bodies and include cookies for session-authenticated operations.

## Conventions

```json
{
  "success": true,
  "message": "Signed in",
  "user": {
    "_id": "USER_ID",
    "name": "Alex Example",
    "email": "alex@example.com",
    "role": "Client",
    "isVerified": true
  },
  "refreshTokenExpiryDate": "EXPIRES_AT"
}
```

The example shows the login response shape. The public DTO can also include `createdAt`, `updatedAt`, `lastLogin` and `pendingEmailChange`. JSON omits optional properties that are undefined. JWT values and password/token hashes are never part of this DTO; authentication cookies arrive in `Set-Cookie` headers.

Errors use `{ "success": false, "message": "…" }`. The unverified-login error also includes `code: "VERIFICATION_REQUIRED"`.

## Public authentication endpoints

| Method | Path | JSON body or query | Result |
| --- | --- | --- | --- |
| POST | `/auth/signup` | `{ name, email, password }` | `201`, public user; verification mail queued. |
| POST | `/auth/verify-email` | `{ email, code }` | Verified user, session cookies and refresh expiry. |
| POST | `/auth/login` | `{ email, password }` | User, session cookies and refresh expiry. |
| POST | `/auth/resend-verification-email` | `{ email }` | Neutral message; new code queued if needed. |
| POST | `/auth/forgot-password` | `{ email }` | Neutral message; link queued for an existing account. |
| POST | `/auth/reset-password/:token` | `{ password }` | Consumes link, changes password, revokes sessions. |
| POST | `/auth/confirm-email-change` | `{ token }` | Consumes link, changes address, revokes sessions. |
| GET | `/auth/check-email?email=…` | Email query string | `{ success, message, isAvailable }`. |

`check-email` deliberately exposes availability and is covered by the overall auth request limit. Avoid using it to enumerate accounts.

## Session endpoints

These routes are registered before `verifyToken`, but validate the relevant cookies internally.

| Method | Path | Authentication | Result |
| --- | --- | --- | --- |
| POST | `/auth/refresh-token` | Valid refresh cookie | Rotated refresh cookie, new access cookie, user and expiry. |
| POST | `/auth/logout` | Existing session cookies, if present | Revokes the identified current session and clears cookies. |

## Protected account endpoints

| Method | Path | JSON body | Result |
| --- | --- | --- | --- |
| GET | `/auth/check-auth` | None | Public current user. |
| GET | `/auth/me` | None | Public user; requires own-profile read permission. |
| PUT | `/auth/update-profile` | `{ name }` | Updated user; only the name can be changed here. |
| POST | `/auth/change-password` | `{ oldPassword, newPassword }` | Changes password and signs out all sessions. |
| POST | `/auth/request-email-change` | `{ newEmail, password }` | Updated user with pending email; confirmation mail queued. |
| POST | `/auth/delete-account` | `{ password }` | Anonymizes the account and revokes all sessions. |

All protected routes require a verified, non-deleted user, an unexpired session, matching session versions and a valid access JWT.

## Try a request

This is an illustrative browser request; use test credentials you created locally:

```javascript
const response = await fetch("http://localhost:7500/api/auth/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "alex@example.com",
    password: "your-local-test-password",
  }),
});

const result = await response.json();
if (!response.ok) throw new Error(result.message);
console.log(result.user);
```

Run browser requests from the configured frontend origin. `credentials: "include"` is required for cookies when using `fetch`. Do not try to read the HttpOnly cookies from JavaScript.

## HTTP status reference

| Status | Meaning in this API |
| --- | --- |
| `200` | Operation completed or neutral recovery response returned. |
| `201` | New account created. |
| `400` | Invalid input, incorrect current password or expired/invalid code or link. |
| `401` | Invalid credentials, missing/expired cookies or a revoked session. |
| `403` | Email verification required, permission denied or disallowed origin. |
| `404` | Unknown route or account unavailable for the requested operation. |
| `409` | Email conflict or concurrent account change. |
| `413` | Request body exceeds the JSON size limit. |
| `415` | A request body was sent with an unsupported content type. |
| `429` | A request budget was exhausted. |
| `500` | Unexpected server failure; public response hides internal details. |
| `503` | `/health` reports that MongoDB is disconnected. |

## Health endpoint

`GET /api/health` is outside the auth router. It returns `{ success: true }` with `200` when Mongoose is connected, or `{ success: false }` with `503` when it is not. It checks database readiness, not SMTP delivery or all application behavior.
