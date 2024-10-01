// src/pages/auth/Register.jsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../layouts/AuthLayout";
import InputBox from "../../components/inputBox/InputBox"; // Custom Input component
import AuthContext from "../../context/AuthContext";

// Yup schema for validation
const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const { login } = useContext(AuthContext); // Or use a separate register function

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      // Implement your registration API call here
      // For example:
      // const response = await registerApi(values.name, values.email, values.password);

      // Assuming registration also logs the user in:
      // if (response.success) {
      //   await login({ email: values.email, password: values.password }, () => {});
      // }

      // For demonstration, simulate successful registration and login:
      const simulatedResponse = {
        success: true,
        user: { id: "123", name: values.name, email: values.email },
      };

      if (simulatedResponse.success) {
        login({ email: values.email, password: values.password }, () => {});
        toast.success("Registered and logged in successfully!");
      } else {
        toast.error(simulatedResponse.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred during registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="">
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
                  className="w-full cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90"
                >
                  {isSubmitting ? "Registering..." : "Sign Up"}
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
  );
};

export default Register;
