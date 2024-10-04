// utils/routes.js
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profiles";
import Home from "../pages/home/Home";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import ConfirmEmail from "../pages/auth/ConfirmEmail";
import ForgetPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import EditProfile from "../pages/profile/EditProfile";
import EditEmail from "../pages/profile/EditEmail";
import ConfirmationEmailChange from "../pages/profile/ConfirmationEmailChange";

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
  {
    path: "/forget-password",
    element: (
      <PublicRoute>
        <ForgetPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  }, // Add this route
];

export const getAllPublicPaths = () => publicRoutes.map((route) => route.path);

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
    path: "/confirm-email-change/:token",
    element: (
      <PrivateRoute>
        <ConfirmationEmailChange />
      </PrivateRoute>
    ),
  },
];
