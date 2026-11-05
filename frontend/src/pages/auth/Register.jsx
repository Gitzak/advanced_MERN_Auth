import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../layouts/AuthLayout";
import InputBox from "../../components/inputBox/InputBox";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";

// Yup schema for validation
const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      await register(values, navigate);
    } catch (_error) {
      toast.error("An unexpected error occurred during registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <title>Register - MERN APP</title>

      <AuthLayout>
        <div className="register-container">
          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form>
                <h1 className="mt-3 mb-4 text-2xl font-semibold text-gray-700 dark:text-white">
                  Register
                </h1>

                {/* Name Field */}
                <Field name="name">
                  {({ field }) => (
                    <InputBox
                      type="text"
                      name="name"
                      placeholder="Name"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 w-full text-left mb-2"
                />

                {/* Email Field */}
                <Field name="email">
                  {({ field }) => (
                    <InputBox
                      type="email"
                      name="email"
                      placeholder="Email"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 w-full text-left mb-2"
                />

                {/* Password Field */}
                <Field name="password">
                  {({ field }) => (
                    <InputBox
                      type="password"
                      name="password"
                      placeholder="Password"
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
                      placeholder="Confirm Password"
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

export default Register;
