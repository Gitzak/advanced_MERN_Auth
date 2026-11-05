import { useContext } from "react";
import Sidebar from "../components/sideBar/Sidebar";
import Header from "../components/header/Header";
import Alert from "../components/alert/Alert";
import AuthContext from "../context/AuthContext";

const DashboardLayout = ({ children, flush = false }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 flex flex-col">
        <Header />
        <main
          className={`flex-1 w-full ${flush ? "bg-white" : "p-3 md:p-6 mt-1 bg-gray-50"}`}
        >
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
