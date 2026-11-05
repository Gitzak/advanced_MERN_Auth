import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For accessing token from URL and navigation
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../layouts/AuthLayout";
import InputBox from "../../components/inputBox/InputBox";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";

// Yup schema for validation
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Please enter your password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  const { resetPasswordWithToken } = useContext(AuthContext); // Use resetPasswordWithToken from AuthProvider
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Call the resetPasswordWithToken function from AuthProvider
      await resetPasswordWithToken(token, values.password, navigate);
    } catch (_error) {
      toast.error("An error occurred, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <title>Reset Password - MERN APP</title>

      <AuthLayout>
        <div className="reset-password-container">
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form>
                <h1 className="mt-3 mb-4 text-2xl font-semibold text-gray-700 dark:text-white">
                  Reset Your Password
                </h1>

                {/* Password Field */}
                <Field name="password">
                  {({ field }) => (
                    <InputBox
                      type="password"
                      name="password"
                      placeholder="Enter your new password"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 w-full text-left mb-2"
                />

                {/* Confirm Password Field */}
                <Field name="confirmPassword">
                  {({ field }) => (
                    <InputBox
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your new password"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 w-full text-left mb-2"
                />

                <div className="mb-10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </AuthLayout>
    </>
  );
};

export default ResetPassword;
