import { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import InputBox from "../../components/inputBox/InputBox";
const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Current password is required"),
});
export default function EditEmail() {
  const { user, requestEditEmail } = useContext(AuthContext);
  return (
    <>
      <title>Edit Email - MERN APP</title>
      <DashboardLayout>
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl">Edit Email</h1>
          <Link to="/profile" className="text-primary">
            Cancel
          </Link>
        </div>
        <p className="mb-4">
          Confirm with your current password. Your address changes only after
          you confirm the email link.
        </p>
        <Formik
          initialValues={{
            email: user.pendingEmailChange || user.email,
            password: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            const result = await requestEditEmail(
              values.email,
              values.password,
            );
            if (result.success)
              resetForm({ values: { ...values, password: "" } });
          }}
        >
          {({ isSubmitting }) => (
            <Form className="max-w-lg rounded border border-gray-200 bg-white p-4">
              <label htmlFor="email">New email</label>
              <Field name="email">
                {({ field }) => (
                  <InputBox {...field} type="email" autoComplete="email" />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-600 mb-2"
              />
              <label htmlFor="password">Current password</label>
              <Field name="password">
                {({ field }) => (
                  <InputBox
                    {...field}
                    type="password"
                    autoComplete="current-password"
                  />
                )}
              </Field>
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-600 mb-2"
              />
              <button
                disabled={isSubmitting}
                type="submit"
                className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send confirmation link"}
              </button>
            </Form>
          )}
        </Formik>
      </DashboardLayout>
    </>
  );
}
