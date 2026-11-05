# README screenshot assets

These images are captured from the local Data App UI and are referenced by the root README using relative paths. Keep them versionable; they are intentionally outside the ignored output/playwright directory.

| File | Frame | Content |
| --- | --- | --- |
| dashboard.png | 1440 x 560 | Compact workspace overview. |
| sign-in.png | 640 x 640 | Centered sign-in card. |
| sign-up.png | 640 x 640 | Registration with demo form values. |
| password-recovery.png | 640 x 640 | Recovery request form. |
| profile.png | 1440 x 600 | Profile data and account actions. |
| account-settings.png | 1440 x 820 | Password change and deletion settings. |
| documentation.png | 1600 x 900 | Integrated Markdown developer handbook. |

The authentication cards use the same 640-pixel square viewport region, avoiding the large empty background around the original full-screen examples. Workspace previews are framed to retain useful navigation and account controls.

The demo identity is presentation-only: Demo User, demo@example.com, role Client. Authenticated previews use an isolated browser response fixture. Capturing these images does not seed a user, grant an admin role, change the database, or prove an authenticated backend workflow. No form is submitted and no real credentials are included.

To update an image, recapture the corresponding live screen with the same framing and demo values. Avoid browser chrome, hover menus, focus outlines, toasts, error states, real account details, and captured auth cookies.
