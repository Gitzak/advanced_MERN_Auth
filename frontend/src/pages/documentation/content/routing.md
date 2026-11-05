React Router controls screens and navigation. Routes are declared in `frontend/src/utils/routes.jsx`, lazy page imports live in `pages/LazyPages.jsx`, and authentication decisions are shared through `AuthProvider`.

## Public routes

| Path | Screen | Behavior |
| --- | --- | --- |
| `/` | Landing page | Public homepage. |
| `/login` | Sign in | Signed-in users are sent to `/dashboard`. |
| `/register` | Register | Signed-in users are sent to `/dashboard`. |
| `/confirm-email` | Verify email | Signed-in users are sent to `/dashboard`. |
| `/forget-password` | Request reset | Public, including for a signed-in user. |
| `/reset-password/:token` | Set new password | Public token-based recovery. |
| `/confirm-email-change/:token` | Confirm new email | Public link with an explicit confirmation action. |
| Any unmatched path | Not found | Offers a link back to the homepage. |

The UI path is spelled `/forget-password`; the API endpoint is `/api/auth/forgot-password`.

## Private routes

| Path | Screen |
| --- | --- |
| `/dashboard` | Account overview and shortcuts. |
| `/profile` | Public profile details. |
| `/edit-profile` | Display-name form. |
| `/edit-email` | Email-change request form. |
| `/settings` | Password change and account deletion. |
| `/documentation` | Documentation overview. |
| `/documentation/:slug` | Individual project guide. |

`PrivateRoute` waits for the initial session check. It renders protected content only when `user.isVerified` is true; otherwise it replaces the current route with `/login`. It does not currently preserve the attempted path for a post-login return.

## Redirect reference

| Event | Destination |
| --- | --- |
| Successful sign-in | `/dashboard` |
| Successful registration | `/confirm-email` |
| Unverified login with valid credentials | `/confirm-email` |
| Successful email verification | `/dashboard` |
| Successful password reset or change | `/login` |
| Successful email-change confirmation | `/login` |
| Sign out or account deletion | `/login` |
| Lost session on a private page | `/login` |

An unknown documentation slug displays a documentation-specific not-found state with a way back to the overview.

## Calling a protected API

Use the existing Axios instance so credentials and refresh behavior stay consistent:

```javascript
import api from "../../api/axiosInstance";

export async function loadProfile() {
  const response = await api.get("/auth/me");
  return response.data.user;
}
```

The base URL already ends in `/api`. Do not prepend `/api` again when calling this instance.

## Adding a private screen

Create a default-exported page, add its lazy import in `pages/LazyPages.jsx`, then register it in `privateRoutes`:

```jsx
// Example route definition
{
  path: "/your-page",
  element: (
    <PrivateRoute>
      <YourPage />
    </PrivateRoute>
  ),
}
```

Wrap workspace screens in `DashboardLayout` to retain the sidebar and header. Add a matching navigation entry with an accessible label. Any new backend operation still needs its own server-side authentication, validation and permission checks.
