import {
  Login,
  Register,
  Dashboard,
  Profile,
  Home,
  ConfirmEmail,
  ForgetPassword,
  ResetPassword,
  EditProfile,
  EditEmail,
  AccountSettings,
  ConfirmationEmailChange,
  Documentation,
} from "../pages/LazyPages";
import { Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
export const publicRoutes = [
  { path: "/", element: <Home /> },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/confirm-email",
    element: (
      <PublicRoute>
        <ConfirmEmail />
      </PublicRoute>
    ),
  },
  { path: "/forget-password", element: <ForgetPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  {
    path: "/confirm-email-change/:token",
    element: <ConfirmationEmailChange />,
  },
  {
    path: "*",
    element: (
      <main className="p-8 text-center">
        <h1 className="text-3xl mb-4">Page not found</h1>
        <Link className="text-primary" to="/">
          Back to home
        </Link>
      </main>
    ),
  },
];
export const privateRoutes = [
  {
    path: "/documentation/:slug?",
    element: (
      <PrivateRoute>
        <Documentation />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  {
    path: "/edit-profile",
    element: (
      <PrivateRoute>
        <EditProfile />
      </PrivateRoute>
    ),
  },
  {
    path: "/edit-email",
    element: (
      <PrivateRoute>
        <EditEmail />
      </PrivateRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <AccountSettings />
      </PrivateRoute>
    ),
  },
];
