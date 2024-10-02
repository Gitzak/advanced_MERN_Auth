import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useContext } from "react";

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>Profile - MERN APP</title>
      </Helmet>
      <DashboardLayout>
        <h1 className="text-3xl">Profile</h1>
      </DashboardLayout>
    </>
  );
};

export default Profile;
