import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
const actionClass =
  "inline-flex min-h-10 items-center justify-center rounded px-4 py-2 text-base font-normal text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";
export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <>
      <title>Profile - MERN APP</title>
      <DashboardLayout>
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <h1 className="text-3xl">Profile</h1>
          <Link
            to="/edit-profile"
            className={`${actionClass} bg-primary hover:bg-blue-700 focus-visible:outline-primary`}
          >
            Edit profile
          </Link>
        </div>
        <dl className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {[
            ["Name", user.name],
            ["Email", user.email],
            ["Role", user.role],
            ["Email status", user.isVerified ? "Verified" : "Pending"],
            ["Created", new Date(user.createdAt).toLocaleDateString()],
            [
              "Last sign-in",
              user.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : "Just registered",
            ],
          ].map(([label, value]) => (
            <div className="grid gap-2 p-4 sm:grid-cols-3" key={label}>
              <dt className="font-medium">{label}</dt>
              <dd className="sm:col-span-2 break-words min-w-0">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/edit-email")}
            className={`${actionClass} bg-teal-700 hover:bg-teal-800 focus-visible:outline-teal-700`}
          >
            Change email
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className={`${actionClass} bg-slate-600 hover:bg-slate-700 focus-visible:outline-slate-600`}
          >
            Account settings
          </button>
        </div>
      </DashboardLayout>
    </>
  );
}
