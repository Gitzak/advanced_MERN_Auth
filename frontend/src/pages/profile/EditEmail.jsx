import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputBox from "../../components/inputBox/InputBox";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const EditEmail = () => {
  const { user, requestEditEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);

  // Yup validation schema
  const EditEmailSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      requestEditEmail(values.email);
    } catch (error) {
      toast.error("An error occurred, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Email - MERN APP</title>
      </Helmet>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl">Edit Email</h1>
          <Link
            to="/profile"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>

        <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
          {/* Formik form */}
          <Formik
            initialValues={{
              email: user?.pendingEmailChange || user?.email || "",
            }}
            validationSchema={EditEmailSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="p-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  {/* Name field */}
                  <Field name="email">
                    {({ field }) => (
                      <InputBox
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {isSubmitting ? "Submitting..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </DashboardLayout>
    </>
  );
};

export default EditEmail;
