import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../layouts/AuthLayout";
import InputBox from "../../components/inputBox/InputBox"; // Assuming this is your custom Input component
import AuthContext from "../../context/AuthContext";

// Import toast
// import { toast } from "react-toastify";

// Yup schema for validation
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  return (
    <AuthLayout>
      <div className="">
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await login(values, navigate);
            } catch (error) {
              // Handle any additional errors if needed
              // toast.error("An error occurred during login.");
              console.log(error);
            }
            setSubmitting(false); // Formik's submission handling
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <h1 className="mt-3 mb-4 text-2xl font-semibold text-gray-700 dark:text-white">
                Login
              </h1>

              {/* Email Field */}
              <Field name="email">
                {({ field }) => (
                  <InputBox
                    type="email"
                    name="email"
                    placeholder="Email"
                    {...field} // Spread Formik's field props
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
                    {...field} // Spread Formik's field props
                  />
                )}
              </Field>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 w-full text-left mb-2"
              />

              <div className="mb-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90"
                >
                  {isSubmitting ? "Submitting..." : "Sign In"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <a
          href="/#"
          className="mb-2 inline-block text-base text-dark hover:text-primary hover:underline dark:text-white"
        >
          Forget Password?
        </a>
        <p className="text-base text-body-color dark:text-dark-6">
          <span className="pr-0.5">Not a member yet?</span>
          <Link to="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
