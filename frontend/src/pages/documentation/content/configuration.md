Configuration lives in environment files, with validation performed by `backend/config/env.js`. Keep actual credentials in `backend/.env`; the documentation and examples contain placeholders only.

## Backend variables

| Variable | Required or default | Meaning |
| --- | --- | --- |
| `NODE_ENV` | `development` | Accepts `development`, `test` or `production`. Production enables Secure cookies. |
| `PORT` | `7500` | API port, from 1 to 65535. |
| `CLIENT_URL` | `http://localhost:3000` | Frontend origin used for CORS, origin validation and email links. |
| `MONGO_URI` | Required | A `mongodb://` or `mongodb+srv://` connection string. |
| `JWT_SECRET` | Required | Access-token signing and keyed token hashing; at least 32 characters. |
| `JWT_REFRESH_SECRET` | Required | Separate refresh-token signing secret; at least 32 characters. |
| `ACCESS_TOKEN_SECONDS` | `900` | Access lifetime in seconds; allowed range 1–3600. |
| `REFRESH_TOKEN_SECONDS` | `604800` | Absolute session lifetime in seconds; minimum 60. |
| `SMTP_HOST` | Required | SMTP hostname. |
| `SMTP_PORT` | `2525` | SMTP port. Port 465 selects an implicit TLS transport. |
| `SMTP_USER` | Required | SMTP username from your sandbox settings. |
| `SMTP_PASS` | Required | SMTP password from your sandbox settings. |
| `EMAIL_FROM` | `MERN Auth <from@example.com>` | Sender display name and address. Override it for your own branding. |

Invalid configuration stops startup. Validation errors name the variables without printing their secret values. The two JWT secrets must differ.

## A safe local template

```dotenv
# backend/.env — replace placeholders locally
NODE_ENV=development
PORT=7500
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://127.0.0.1:27017/advanced_mern_auth

JWT_SECRET=replace-with-a-unique-random-secret-at-least-32-characters
JWT_REFRESH_SECRET=replace-with-another-unique-random-secret-at-least-32-characters
ACCESS_TOKEN_SECONDS=900
REFRESH_TOKEN_SECONDS=604800

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-sandbox-smtp-username
SMTP_PASS=your-sandbox-smtp-password
EMAIL_FROM="Data App Dev <from@example.com>"
```

Generate a fresh secret locally, and run the command a second time for the refresh secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Changing `JWT_SECRET` invalidates existing access tokens and keyed token hashes, including pending verification/reset links. Plan to sign in again and request new links after rotating it.

## Connect MongoDB Atlas

1. Create a cluster and a database user with access to the development database.
2. Add the network you are connecting from to the project's **IP Access List**.
3. Copy the driver connection string and replace its username, password and database placeholders locally.
4. URL-encode special characters in the username or password when inserting them into a URI.
5. Restart the backend and check `/api/health`.

```dotenv
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/advanced_mern_auth?retryWrites=true&w=majority
```

> Moving between home, a café, a VPN or mobile data can change your public IP. Add the current IP in Atlas if it is no longer allowed. A connection or TLS error alone does not prove the access list is the cause; check network reachability, DNS and cluster status too.

If the local resolver fails to resolve SRV records, use the standard connection format supplied for the cluster, retaining its hosts, replica set, `authSource` and TLS options. Do not disable certificate verification to make a failing connection appear successful.

## Frontend configuration

```dotenv
# frontend/.env
VITE_APP_API_URL=http://localhost:7500/api
```

Only this public endpoint belongs in the frontend. Vite exposes `VITE_*` values to browser code, so MongoDB, SMTP and JWT secrets must stay in the backend.

## Origins and cookies

Keep frontend and API on the same site. Different localhost ports work with the configured credentials and allowed origin, but `localhost` and `127.0.0.1` should not be mixed across the two URLs.

- Frontend Axios uses `withCredentials: true`.
- API CORS allows the configured frontend origin with credentials.
- Mutating requests with an unexpected `Origin` are rejected.
- Cookies use `HttpOnly`, `SameSite=Strict` and path `/`.
- `NODE_ENV=production` adds `Secure`, so production requires HTTPS.

Restart the relevant server after changing its environment variables.
