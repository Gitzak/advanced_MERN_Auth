Run the frontend and backend in separate terminals. Use the lockfiles included with each project so the installed dependency tree stays reproducible.

## Before you start

- **Node.js:** a version supported by both package manifests: `^22.22.2`, `^24.15.0` or `>=26.0.0`.
- **npm:** available with your Node.js installation.
- **MongoDB:** a local instance or an Atlas cluster with a database user and network access.
- **SMTP:** a Mailtrap Sandbox inbox for development emails.
- Free local ports **3000** for Vite and **7500** for the API.

```powershell
node --version
npm --version
```

## Start the backend

Open a terminal at the repository root:

```powershell
cd backend
npm ci

# Create a local configuration only if it does not already exist.
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
}
```

Edit `backend/.env` with your MongoDB connection string, two different JWT secrets and your SMTP credentials. The example is a template; its placeholder credentials are not a working configuration. See [Environment configuration](/documentation/configuration) for every variable.

```powershell
npm run dev
```

Development mode uses Node's built-in `--watch` option. Changes to backend source files restart the process. The API starts listening only after the MongoDB connection succeeds.

## Start the frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open **http://localhost:3000**. Vite uses a strict port: if port 3000 is already occupied, stop the old process or deliberately update both the Vite configuration and `CLIENT_URL`.

The frontend reads this public API URL:

```dotenv
# frontend/.env
VITE_APP_API_URL=http://localhost:7500/api
```

Restart Vite after changing environment files.

## Check the connection

```powershell
Invoke-RestMethod http://localhost:7500/api/health
```

A connected API responds with HTTP `200` and:

```json
{ "success": true }
```

If a running API loses its database connection, the health endpoint responds with `503`. If the API cannot connect during startup, it exits instead of serving authentication requests.

## Create your first account

1. Open **Register** and enter a name, email and password.
2. Submit the form. The application opens **Verify your email**.
3. Open the message in your **Mailtrap Sandbox inbox**. Sandbox messages are captured there, not delivered to the recipient's real inbox.
4. Enter the six-digit code with the same email address.
5. Successful verification creates a session and opens the dashboard.

Codes expire after **10 minutes** and allow **five incorrect attempts**. Use **Send a new code** if the code expires or the attempts are exhausted.

## Useful commands

| Project | Command | Purpose |
| --- | --- | --- |
| Backend | `npm run dev` | Start with source watching. |
| Backend | `npm start` | Start the API without watching. |
| Backend | `npm test` | Run isolated integration tests. |
| Frontend | `npm run dev` | Start the Vite development server. |
| Frontend | `npm test` | Run frontend behavior tests. |
| Frontend | `npm run lint` | Check JavaScript and React rules. |
| Frontend | `npm run build` | Generate the production frontend in `dist/`. |
| Frontend | `npm run preview` | Preview the built frontend locally. |

> Vite preview does not start the backend. If preview uses a different origin, configure `CLIENT_URL` for that origin and restart the API before testing cookie-authenticated requests.
