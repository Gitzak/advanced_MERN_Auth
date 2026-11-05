The browser stores server-managed cookies. React keeps the public user in memory, while MongoDB stores the account and a revocable session. Client route guards improve navigation; the API independently enforces authentication.

## Registration and verification

```text
Register → account created, not verified
         → verification email queued
         → /confirm-email

Email + valid code → code consumed atomically
                  → account verified
                  → session and cookies created
                  → /dashboard
```

Verification codes contain six cryptographically generated digits. The backend stores a keyed hash, binds the query to the email address and enforces a 10-minute lifetime with a five-error attempt budget. Resending replaces the old code and resets that budget.

The registration response contains a public user DTO, never the code or password hash. An unverified account does not receive an authenticated session at signup.

## Sign-in behavior

`POST /api/auth/login` validates the email and password. A verified account receives its public user, a refresh expiry timestamp and two HttpOnly cookies. React stores the user and navigates to `/dashboard`.

Valid credentials for an unverified account produce HTTP `403` with code `VERIFICATION_REQUIRED`. The frontend remembers the pending email in session storage and opens `/confirm-email`. That stored email is a convenience, not proof of authentication.

## Session structure

| Item | Location | Purpose |
| --- | --- | --- |
| `token` cookie | Browser, HttpOnly | Short-lived access JWT; 15 minutes by default. |
| `refreshToken` cookie | Browser, HttpOnly | Renewable credential tied to a persisted session. |
| Session record | MongoDB `sessions` | User ID, version, refresh hash and absolute expiry. |
| `sessionVersion` | User record | Invalidates all previous sessions after sensitive changes. |
| Public user | React context | Renders profile details and navigation; contains no auth secrets. |

Access requests verify the JWT signature and claims, then check the active user and unexpired session. A deleted, unverified or revoked account cannot pass by presenting an old cookie.

## Refresh and rotation

For protected API requests, a `401` may trigger one refresh attempt. The frontend shares a refresh promise across simultaneous requests in the same tab. Where Web Locks is available, tabs coordinate and recheck shared cookies before rotating again.

```text
Protected request → 401
  → share one refresh operation
  → validate the persisted refresh hash
  → replace it atomically with a new hash
  → set renewed cookies
  → retry the original request once
```

The session's absolute expiry is not extended by rotation. Reusing an already rotated refresh token revokes that session. If renewal fails, React clears the user and private pages return to `/login`.

Invalid login credentials do not trigger a refresh loop. The refresh endpoint itself is also excluded from the retry interceptor.

## Password recovery

The forgot-password endpoint always presents the same public success message whether or not the address exists. Existing accounts receive a queued link containing a random 64-character hexadecimal token; its keyed hash is stored for one hour.

A successful reset consumes the token atomically, hashes the new password, increments the session version, revokes all account sessions and sends a success notification. The user must sign in again. Concurrent submissions cannot both consume the same token.

## Sensitive account changes

| Operation | Required proof | Session effect |
| --- | --- | --- |
| Edit name | Active verified session | Current sessions remain valid. |
| Request email change | Active session and current password | Current email remains until confirmation. |
| Confirm email change | Valid one-hour email token | All sessions revoked; sign in with the new address. |
| Change password | Active session and current password | All sessions revoked; sign in again. |
| Delete account | Active session and current password | Account anonymized, secrets unset, all sessions revoked. |
| Sign out | Current session cookie | Current session revoked and browser cookies cleared. |

There is no automatic account restoration flow. The email-change confirmation page is public and requires an explicit confirmation click; visiting the page alone does not consume the link.

## Validation and request budgets

- New passwords: at least **8 characters**, at most **72 UTF-8 bytes** for bcrypt. Bytes and characters differ for accented letters and emoji.
- Names: trimmed, required, at most **100 characters**.
- Email: trimmed, normalized to lowercase and validated.
- Request bodies: strict schemas reject unknown fields and operator objects; JSON payload limit is **16 KB**.
- All auth routes: **100 requests per 15 minutes per IP**.
- Login: **10 failed attempts per 15 minutes per normalized email**; successful requests do not consume the failed-attempt budget.
- Email-producing signup/resend/reset operations: **3 requests per minute per email**. Email changes use the authenticated user ID for this limiter.

These request limits currently live in process memory. Multiple production instances need a shared limiter store and a deliberate proxy configuration.
