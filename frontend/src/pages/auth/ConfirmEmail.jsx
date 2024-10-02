import { Helmet } from "react-helmet-async";
import { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../layouts/AuthLayout";
import InputBox from "../../components/inputBox/InputBox";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext"; // Import AuthContext

// Yup schema for 6-digit code validation
const ConfirmEmailSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, "Code must be 6 digits")
    .required("Please enter the code"),
});

const ConfirmEmail = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const { confirmEmail } = useContext(AuthContext); // Use confirmEmail from AuthProvider
  const navigate = useNavigate(); // For navigation after email confirmation

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Call the confirmEmail function from AuthProvider
      await confirmEmail(values.code, navigate);
    } catch (error) {
      toast.error("An error occurred, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Confirm Email - MERN APP</title>
      </Helmet>
      <AuthLayout>
        <div className="confirm-email-container">
          <Formik
            initialValues={{ code: "" }}
            validationSchema={ConfirmEmailSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form>
                <h1 className="mt-3 mb-4 text-2xl font-semibold text-gray-700 dark:text-white">
                  Confirm Your Email
                </h1>

                {/* 6-digit code field */}
                <Field name="code">
                  {({ field }) => (
                    <InputBox
                      type="text"
                      name="code"
                      placeholder="Enter 6-digit code"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="code"
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
                      "Submit"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          <p className="text-base text-body-color dark:text-dark-6">
            <span className="pr-0.5">Already have an account?</span>
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default ConfirmEmail;
