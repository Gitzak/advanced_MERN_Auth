import { lazy } from "react";
export const Login = lazy(() => import("./auth/Login"));
export const Register = lazy(() => import("./auth/Register"));
export const Dashboard = lazy(() => import("./dashboard/Dashboard"));
export const Profile = lazy(() => import("./profile/Profiles"));
export const Home = lazy(() => import("./home/Home"));
export const ConfirmEmail = lazy(() => import("./auth/ConfirmEmail"));
export const ForgetPassword = lazy(() => import("./auth/ForgetPassword"));
export const ResetPassword = lazy(() => import("./auth/ResetPassword"));
export const EditProfile = lazy(() => import("./profile/EditProfile"));
export const EditEmail = lazy(() => import("./profile/EditEmail"));
export const AccountSettings = lazy(() => import("./profile/AccountSettings"));
export const ConfirmationEmailChange = lazy(
  () => import("./profile/ConfirmationEmailChange"),
);
