Start by separating frontend navigation, API availability, database connectivity and SMTP delivery. A generic sign-in message does not identify which layer failed.

## The API is unavailable

```powershell
Invoke-RestMethod http://localhost:7500/api/health
```

- **Connection refused:** confirm the backend process is running and uses port 7500.
- **HTTP 503:** the API is listening but its MongoDB connection is not ready.
- **Startup failed:** validate `backend/.env`, then check the database network and user permissions.

Environment validation deliberately prints variable names rather than secret values. Correct those variables locally; do not paste a full connection string into a public report.

## MongoDB fails after changing networks

Switching from home to a café, a VPN or mobile data can change the public source IP. In Atlas, open the project's **Network Access / IP Access List**, add the current IP and wait for the entry to become active.

Also check cluster status, the database user's access, DNS resolution and outbound connectivity. A TLS or `MongooseServerSelectionError` message can have several causes; it does not conclusively identify an access-list failure.

If SRV resolution fails, verify the hostname and network resolver. A standard cluster URI is an alternative when obtained from the cluster's actual connection settings. Keep TLS and certificate validation enabled.

## Login returns 401 or 403

| Symptom | What to check |
| --- | --- |
| `Invalid email or password` | Use the registered address and current password; the account may have been deleted. |
| `VERIFICATION_REQUIRED` | Open the verification page and enter a current code. |
| Initial `check-auth` returns 401 | Expected for a visitor without a session; the client may attempt refresh once. |
| An older session stops working | Password/email changes, deletion, logout or refresh replay may have revoked it. |
| Repeated sign-ins return 429 | Wait for the configured request window instead of repeatedly submitting. |

## Cookies are missing or not sent

Check the browser Network and Application panels:

1. Confirm the login response has `Set-Cookie` headers.
2. Confirm Axios uses `withCredentials` or fetch uses `credentials: "include"`.
3. Match `CLIENT_URL` to the actual frontend origin.
4. Use one hostname consistently; do not mix `localhost` with `127.0.0.1`.
5. Keep frontend and API on the same site for the strict cookies.
6. In production, serve HTTPS for Secure cookies.

HttpOnly cookies cannot be read through `document.cookie`. That is expected and is not evidence that a cookie is missing.

## Verification or email change fails

- Verification codes expire after 10 minutes; resend replaces the previous code.
- Five incorrect verification attempts exhaust the current code's budget.
- Codes must be submitted with the matching email address.
- Reset and email-change links expire after one hour and can only be consumed once.
- Email-change confirmation signs out previous sessions; sign in using the new email.
- A target email that becomes occupied before confirmation produces a conflict; request another change.

## No email appears in the real inbox

With Sandbox SMTP, open the **Mailtrap test inbox**, not Gmail or the recipient's mailbox. Confirm the SMTP credentials belong to that sandbox. Delivery is asynchronous, so allow a worker pass and inspect job status if needed.

Pending jobs with repeated attempts usually point to SMTP credentials, network access or service limits. A `sent` job means the SMTP server accepted it; it is not proof that someone opened the message.

## Vite or a page will not load

- Run `npm ci` inside `frontend`, not only at the repository root.
- Confirm your Node version satisfies `frontend/package.json`.
- Free port 3000 or deliberately update the frontend port and backend origin together.
- Restart Vite after changing `.env`.
- If you use `npm run preview`, start the backend separately and allow the preview origin.
- For a deployed SPA, configure the host to fall back to `index.html` for valid frontend routes.

## A request has an ambiguous outcome

If the browser loses a response during a reset, verification or email change, the server may already have completed it. Recheck the account state before resubmitting. A one-time token returning an error on the second request can mean it was already consumed successfully.

Record the endpoint, HTTP status and safe error message when investigating. Exclude passwords, cookies, JWTs, SMTP credentials and raw reset links from reports.
