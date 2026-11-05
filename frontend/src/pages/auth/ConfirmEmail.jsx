import { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import AuthContext from "../../context/AuthContext";
import InputBox from "../../components/inputBox/InputBox";
const schema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  code: Yup.string()
    .matches(/^\d{6}$/, "Enter a six-digit code")
    .required("Code is required"),
});
export default function ConfirmEmail() {
  const { confirmEmail, resendVerification } = useContext(AuthContext);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  return (
    <>
      <title>Verify Email - MERN APP</title>
      <AuthLayout>
        <h1 className="text-2xl font-semibold mb-4">Verify your email</h1>
        <p className="mb-4 text-gray-600">
          Enter the code from your inbox. Codes expire after 10 minutes.
        </p>
        <Formik
          initialValues={{
            email: sessionStorage.getItem("verificationEmail") || "",
            code: "",
          }}
          validationSchema={schema}
          onSubmit={async (values) => {
            await confirmEmail(values.email, values.code);
          }}
        >
          {({ values, isSubmitting }) => (
            <Form className="text-left">
              <Field name="email">
                {({ field }) => (
                  <InputBox
                    {...field}
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-600 text-sm mb-2"
              />
              <Field name="code">
                {({ field }) => (
                  <InputBox
                    {...field}
                    type="text"
                    placeholder="Six-digit code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                )}
              </Field>
              <ErrorMessage
                name="code"
                component="p"
                className="text-red-600 text-sm mb-2"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-primary p-3 text-white disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify email"}
              </button>
              <button
                type="button"
                disabled={
                  sending ||
                  cooldown ||
                  !Yup.string().email().required().isValidSync(values.email)
                }
                className="w-full p-3 text-primary disabled:opacity-50"
                onClick={async () => {
                  setSending(true);
                  try {
                    const result = await resendVerification(values.email);
                    if (result.success) {
                      setCooldown(true);
                      setTimeout(() => setCooldown(false), 60000);
                    }
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {sending
                  ? "Sending..."
                  : cooldown
                    ? "Wait a minute before resending"
                    : "Send a new code"}
              </button>
            </Form>
          )}
        </Formik>
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </AuthLayout>
    </>
  );
}
