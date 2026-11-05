import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <title>Dashboard - MERN APP</title>
      <DashboardLayout>
        <h1 className="text-3xl mb-3">Welcome, {user.name}</h1>
        <p className="text-gray-600 mb-6">
          Manage your profile and account security.
        </p>
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <article className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-xl mb-3">Your account</h2>
            <p className="break-all mb-2">{user.email}</p>
            <p className="text-green-700 mb-4">Email verified</p>
            <Link to="/profile" className="text-primary underline">
              View profile
            </Link>
          </article>
          <article className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-xl mb-3">Security</h2>
            <p className="mb-4">Change your password or manage your account.</p>
            <Link to="/settings" className="text-primary underline">
              Account settings
            </Link>
          </article>
        </div>
      </DashboardLayout>
    </>
  );
}
