import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Loader from "../components/loader/Loader";

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
