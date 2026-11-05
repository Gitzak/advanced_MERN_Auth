import { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import InputBox from "../../components/inputBox/InputBox";
const changeSchema = Yup.object({
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Use at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm the password"),
});
export default function AccountSettings() {
  const { changePassword, deleteAccount } = useContext(AuthContext);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <>
      <title>Account Settings - MERN APP</title>
      <DashboardLayout>
        <h1 className="text-3xl mb-6">Account settings</h1>
        <section className="max-w-lg rounded border border-gray-200 bg-white p-5 mb-6">
          <h2 className="text-xl mb-3">Change password</h2>
          <p className="mb-4 text-gray-600">
            All sessions will be signed out after the change.
          </p>
          <Formik
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={changeSchema}
            onSubmit={async (values) => {
              await changePassword(values.oldPassword, values.newPassword);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                {[
                  ["oldPassword", "Current password"],
                  ["newPassword", "New password"],
                  ["confirmPassword", "Confirm new password"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label htmlFor={name}>{label}</label>
                    <Field name={name}>
                      {({ field }) => (
                        <InputBox
                          {...field}
                          type="password"
                          autoComplete={
                            name === "oldPassword"
                              ? "current-password"
                              : "new-password"
                          }
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name={name}
                      component="p"
                      className="text-red-600 text-sm mb-3"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Change password"}
                </button>
              </Form>
            )}
          </Formik>
        </section>
        <section className="max-w-lg rounded border border-red-200 bg-white p-5">
          <h2 className="text-xl text-red-700 mb-3">Delete account</h2>
          <p className="mb-4">
            This removes access to your account and signs out all sessions.
          </p>
          {!confirmDelete ? (
            <button
              className="text-red-700 underline"
              onClick={() => setConfirmDelete(true)}
            >
              Delete my account
            </button>
          ) : (
            <Formik
              initialValues={{ password: "" }}
              validationSchema={Yup.object({
                password: Yup.string().required("Current password is required"),
              })}
              onSubmit={async (values) => {
                await deleteAccount(values.password);
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <label htmlFor="password">
                    Confirm with your current password
                  </label>
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
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {isSubmitting ? "Deleting..." : "Confirm deletion"}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}
