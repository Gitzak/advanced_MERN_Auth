import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      <Helmet>
        <title>Profile - MERN APP</title>
      </Helmet>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl">Profile</h1>
          <Link
            to="/edit-profile"
            className="cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 flex items-center justify-center"
          >
            Edit Profile
          </Link>
        </div>

        <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
          <dl className="-my-3 divide-y divide-gray-100 text-sm">
            <div className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Name</dt>
              <dd className="text-gray-700 sm:col-span-2">{user.name}</dd>
            </div>

            <div className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Email</dt>
              <dd className="text-gray-700 sm:col-span-2">
                <div className="flex justify-between items-center">
                  {user.email}
                  <Link
                    to="/edit-email"
                    className="cursor-pointer rounded-md border border-blue-300 bg-blue-300 px-3 py-1 font-bold text-gray-800 transition hover:bg-opacity-90 flex items-center justify-center"
                  >
                    Edit Email
                  </Link>
                </div>
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Created at</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {new Date(user.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                  hour12: true,
                })}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Occupation</dt>
              <dd className="text-gray-700 sm:col-span-2">Guitarist</dd>
            </div>

            <div className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Salary</dt>
              <dd className="text-gray-700 sm:col-span-2">$1,000,000+</dd>
            </div>

            <div className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-gray-900">Bio</dt>
              <dd className="text-gray-700 sm:col-span-2">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Et
                facilis debitis explicabo doloremque impedit nesciunt dolorem
                facere, dolor quasi veritatis quia fugit aperiam aspernatur
                neque molestiae labore aliquam soluta architecto?
              </dd>
            </div>
          </dl>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Profile;
