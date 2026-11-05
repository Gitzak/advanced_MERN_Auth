Use behavior checks to validate account flows, then check the browser layout separately. A passing build proves that the frontend compiles; it does not prove that MongoDB, SMTP or authentication is working end to end.

## Backend integration tests

```powershell
cd backend
npm test
```

The suite uses Node's test runner, Supertest and `mongodb-memory-server`. It starts a temporary MongoDB, configures test-only secrets and replaces the SMTP transport. It does not use the configured Atlas database or send real Mailtrap messages.

On the first run, the test helper downloads a MongoDB binary. Allow time and disk space for that download; later runs reuse the cached binary.

Coverage includes:

- Public responses contain no verification codes or password hashes.
- Operator objects, unexpected roles and invalid passwords are rejected.
- Verification belongs to one email and locks after five wrong codes.
- Login returns a user, and profile updates follow an allowlist.
- Refresh rotation and token replay invalidate the correct session.
- Logout revokes copied cookies, not just the local React state.
- Password changes revoke sessions; concurrent reset attempts consume a token only once.
- Recovery responses remain neutral for missing accounts.
- Email changes require the current password and a one-time confirmation.
- Deletion removes stored credentials and blocks old sessions.
- SMTP failure leaves jobs retriable and HTML interpolation is escaped.
- Repeated failed logins reach the request limit.

## Frontend checks

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Vitest, Testing Library and jsdom cover session restoration without localStorage metadata, public reset links, login/verification state changes, redirects, guards and coordinated refresh behavior. Documentation tests cover navigation, search, heading links and copying highlighted code.

## Manual account walkthrough

1. Register a new development account and verify the code from Mailtrap.
2. Reload a private page and confirm the cookie session restores.
3. Sign out, sign in again and update the display name.
4. Request a password-reset link, change the password and confirm an older session is rejected.
5. Request an email change, open its link in another window and explicitly confirm it.
6. Sign in using the new address.
7. Delete the development account and confirm its old cookies no longer authorize requests.

Use dedicated test accounts. The deletion flow anonymizes the record and does not provide automatic restoration.

## Dependency checks

Run in each package directory:

```powershell
npm audit
npm outdated
```

Review direct and transitive dependency changes before upgrading. An audit result is a registry snapshot of known package advisories, not a proof that application code has no vulnerabilities. Use `npm ci` for reproducible installations and keep both lockfiles with reviewed package changes.

## Responsive and accessibility checks

- Verify expanded and collapsed navigation on desktop.
- At mobile widths, check that the sidebar overlays content instead of shrinking it.
- Navigate controls with the keyboard and confirm visible focus indicators.
- Check that forms remain usable with long names, emails and validation messages.
- Check documentation tables and code blocks scroll inside their containers.
- Respect reduced-motion preferences when testing sidebar transitions.
