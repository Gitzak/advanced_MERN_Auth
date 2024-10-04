import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../layouts/DashboardLayout";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";
import Loader from "../../components/loader/Loader";
import { LoaderPinwheelIcon } from "lucide-react";

const ConfirmationEmailChange = () => {
  const { token } = useParams(); // Get token from URL
  const { confirmEmailChange } = useContext(AuthContext); // Use the function from AuthProvider
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await confirmEmailChange(token);

        if (response.success) {
          toast.success(response.message);
          navigate("/profile");
        } else {
          setMessage(response.message);
          setStatus("error");
          toast.error(response.message);
        }
      } catch (error) {
        setMessage("An unexpected error occurred.");
        setStatus("error");
        toast.error("An unexpected error occurred.");
      }
    };

    validateToken();
  }, [token, confirmEmailChange]);

  return (
    <>
      <Helmet>
        <title>Email Change Confirmation - MERN APP</title>
      </Helmet>
      <DashboardLayout>
        <div className="flex justify-center items-center mt-20">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center">
              <LoaderPinwheelIcon className="animate-spin w-8 h-8 mb-2" />
              <span className="text-center">
                Validating token, please wait...
              </span>
            </div>
          )}
          {status === "error" && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Error</h1>
              <p>{message}</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default ConfirmationEmailChange;
