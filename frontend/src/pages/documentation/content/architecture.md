The project separates HTTP concerns, account operations and persistence. Follow these boundaries when adding features so a UI change does not accidentally alter an authentication rule.

## Backend request lifecycle

```text
Request
  → app.js: headers, CORS, JSON parsing and origin policy
  → routes: request limits and endpoint selection
  → validate.js: strict input schema
  → verifyToken.js: active user and session checks, when required
  → permission.js: own-profile access, when required
  → controller: call service and shape HTTP response
  → service: perform account operation
  → model / repository: query MongoDB
  → publicUser: expose only allowed profile fields
```

The precise order is defined per route. Public authentication routes are registered before the router's authentication middleware. Profile permissions apply to `/me` and `/update-profile`; other account operations use their service checks.

## Database collections

| Collection | Responsibility | Important behavior |
| --- | --- | --- |
| `users` | Identity, profile, role and pending challenges | Sensitive fields are excluded from normal selection; DTO serialization uses an allowlist. |
| `sessions` | Active sessions and refresh rotation | Stores refresh hashes and an absolute expiry; TTL index removes expired records asynchronously. |
| `emailjobs` | Queued notifications and retries | Claims jobs with a lock, removes message content after delivery and expires old jobs. |

Authorization does not rely on TTL cleanup happening immediately. Session and token queries explicitly check expiry timestamps.

## User data boundary

`backend/utils/publicUser.js` is the shared response boundary:

```javascript
// Simplified selection from the public DTO
{
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  pendingEmailChange: user.pendingEmailChange,
}
```

If you add a profile field, decide explicitly whether it belongs in this public DTO. Do not spread `user._doc` into API responses, even when fields are marked `select: false`: a newly created document can still contain them in memory.

## Roles and permissions

Roles are declared in `backend/config/roles.js` through AccessControl:

- **Client:** read and update the user's own profile.
- **Employer:** inherits Client and declares create/update/delete permissions for its own jobs.
- **Admin:** inherits Employer and declares broader profile permissions.

Public signup does not accept a role; new accounts default to Client. Employer job permissions and Admin profile permissions are declarations, not a complete job API or admin dashboard. The currently registered profile routes still act on the authenticated user's own account.

## Frontend responsibilities

| Location | Responsibility |
| --- | --- |
| `src/api/auth.js` | Account HTTP functions. |
| `src/api/axiosInstance.js` | Base URL, credentials, timeout and protected-request retry. |
| `src/context/AuthProvider.jsx` | Initial session check, public user state, account actions and redirects. |
| `src/utils/PrivateRoute.jsx` | Wait for auth initialization and require a verified user. |
| `src/utils/PublicRoute.jsx` | Send authenticated visitors away from guest-only screens. |
| `src/pages/LazyPages.jsx` | Load page bundles on demand. |
| `src/layouts/DashboardLayout.jsx` | Workspace sidebar, header and content area. |

## Extending the project

1. Define the input contract with a strict server-side schema.
2. Add service behavior with explicit ownership and permission rules.
3. Return a deliberate response DTO through a controller.
4. Register the endpoint with appropriate authentication and request limits.
5. Add an API helper, then connect a form or screen through the existing context or a feature-specific module.
6. Verify behavior with integration tests and the actual browser flow.

Keep runtime environment validation in one place. Avoid duplicating token lifetimes, secret loading or refresh behavior in individual pages.

## Maintaining this documentation

The guides are real Markdown files in `frontend/src/pages/documentation/content/`. Edit those files to update text, tables and code examples. The guide index in `guides.js` defines titles, descriptions, order and navigation groups.

To add a guide, create a Markdown file, import it with Vite's `?raw` suffix and register it in the guide array. Use unique level-two headings for the page outline. Search, reading time, next/previous navigation and Markdown download are derived from this same content.

```javascript
// Example entry in guides.js
{
  id: "your-guide",
  title: "Your guide",
  description: "Explain the task this guide helps with.",
  group: "Build and integrate",
  content: yourMarkdownImport,
}
```

Keep examples synchronized with the actual route, schema or service they describe. Use placeholders for credentials and run the documentation tests after changing heading structure or navigation.
