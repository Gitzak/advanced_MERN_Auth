import DashboardLayout from "../../layouts/DashboardLayout";
import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputBox from "../../components/inputBox/InputBox";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const EditProfile = () => {
  const { user, updateUser } = useContext(AuthContext); // Assuming `updateUser` is available in AuthContext
  const [isSubmitting, setSubmitting] = useState(false);

  // Yup validation schema
  const EditProfileSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Call the updateUser function (you can implement this in AuthContext)
      await updateUser(values.name);
      // navigate("/profile"); // Redirect to profile page after update
    } catch (_error) {
      toast.error("An error occurred, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <title>Edit Profile - MERN APP</title>

      <DashboardLayout>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl">Edit Profile</h1>
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
            initialValues={{ name: user?.name || "" }}
            validationSchema={EditProfileSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="p-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  {/* Name field */}
                  <Field name="name">
                    {({ field }) => (
                      <InputBox
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="name"
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

export default EditProfile;
