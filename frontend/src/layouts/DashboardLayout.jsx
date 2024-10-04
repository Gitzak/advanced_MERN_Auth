import React, { useContext, useState } from "react";
import Sidebar from "../components/sideBar/Sidebar";
import Header from "../components/header/Header";
import Alert from "../components/alert/Alert";
import AuthContext from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 mt-1 bg-gray-50 w-full">
          {user?.pendingEmailChange && (
            <Alert
              type="warning"
              title="Email Change Request"
              content="Email change request sent. Please check your new email to confirm."
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
