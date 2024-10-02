// utils/routes.js
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profiles";
import Home from "../pages/home/Home";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import ConfirmEmail from "../pages/auth/ConfirmEmail";

// Array for public routes
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
];

// Array for private routes
export const privateRoutes = [
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
];
