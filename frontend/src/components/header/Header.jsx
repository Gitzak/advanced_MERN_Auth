import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import AuthContext from "../../context/AuthContext";
export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  return (
    <header className="bg-white shadow-sm p-3 md:p-4 flex items-center justify-between gap-3">
      <Link
        to="/profile"
        className="flex min-w-0 items-center gap-2"
        aria-label="Your profile"
      >
        <User className="shrink-0" size={20} />
        <span className="truncate max-w-40 md:max-w-sm">{user?.name}</span>
      </Link>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="text-sm text-primary"
        >
          Settings
        </button>
        <button
          aria-label="Sign out"
          disabled={busy}
          className="flex items-center gap-1 text-sm disabled:opacity-50"
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
            } finally {
              setBusy(false);
            }
          }}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">
            {busy ? "Signing out..." : "Sign out"}
          </span>
        </button>
      </div>
    </header>
  );
}
