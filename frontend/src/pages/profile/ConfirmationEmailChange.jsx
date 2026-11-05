import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import AuthContext from "../../context/AuthContext";
export default function ConfirmationEmailChange() {
  const { token } = useParams();
  const { confirmEmailChange } = useContext(AuthContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <title>Confirm Email Change - MERN APP</title>
      <AuthLayout>
        <h1 className="mb-4 text-2xl font-semibold">Confirm your new email</h1>
        <p className="mb-4">
          After confirming, sign in again with your new email address.
        </p>
        {error && (
          <p role="alert" className="mb-4 text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={busy || !token}
          className="w-full rounded bg-primary p-3 text-white disabled:opacity-50"
          onClick={async () => {
            setBusy(true);
            try {
              const result = await confirmEmailChange(token);
              if (!result.success) setError(result.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Confirming..." : "Confirm email change"}
        </button>
        <Link to="/login" className="mt-4 block text-primary">
          Back to sign in
        </Link>
      </AuthLayout>
    </>
  );
}
