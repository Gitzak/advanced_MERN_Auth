import BrandLogo from "../BrandLogo";
import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  User,
  Settings,
  BookOpen,
} from "lucide-react";
import AuthContext from "../../context/AuthContext";
const items = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Account settings", icon: Settings, path: "/settings" },
];
export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(() => window.innerWidth >= 768);
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const changed = (event) => {
      setMobile(event.matches);
      setOpen(!event.matches);
    };
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  return (
    <div className="app-sidebar-shell shrink-0" data-open={open}>
      {mobile && (
        <button
          aria-label="Close navigation"
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
          className="app-sidebar-backdrop fixed inset-0 z-30 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        aria-label="Main navigation"
        className="app-sidebar bg-blue-600 text-white flex flex-col h-dvh"
      >
        <div className="app-sidebar-heading relative shrink-0 h-18">
          <div className="app-sidebar-brand" aria-hidden={!open}>
            <BrandLogo className="w-40 h-auto text-white [--brand-mark-ink:#2563eb]" />
          </div>
          <button
            type="button"
            aria-label={open ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={open}
            className="app-sidebar-toggle flex items-center justify-center rounded-lg hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2">
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  aria-label={item.name}
                  title={item.name}
                  onClick={() => {
                    if (mobile) setOpen(false);
                  }}
                  className={({ isActive }) =>
                    "app-sidebar-item rounded-lg " +
                    (isActive ? "bg-blue-700" : "hover:bg-blue-700")
                  }
                >
                  <item.icon
                    className="shrink-0"
                    size={20}
                    aria-hidden="true"
                  />
                  <span className="app-sidebar-label" aria-hidden={!open}>
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="shrink-0 px-2 pb-3">
          <NavLink
            to="/documentation"
            aria-label="Documentation"
            title="Documentation"
            onClick={() => {
              if (mobile) setOpen(false);
            }}
            className={({ isActive }) =>
              "app-sidebar-item rounded-lg " +
              (isActive ? "bg-blue-700" : "hover:bg-blue-700")
            }
          >
            <BookOpen className="shrink-0" size={20} aria-hidden="true" />
            <span className="app-sidebar-label" aria-hidden={!open}>
              Documentation
            </span>
          </NavLink>
        </div>
        <div className="shrink-0 border-t border-blue-500 p-2">
          <button
            aria-label="Sign out"
            title="Sign out"
            disabled={busy}
            className="app-sidebar-item w-full rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              try {
                await logout();
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut className="shrink-0" size={20} aria-hidden="true" />
            <span className="app-sidebar-label" aria-hidden={!open}>
              {busy ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
        <div className="app-sidebar-account shrink-0" aria-hidden={!open}>
          <div className="flex items-center gap-3 px-4 py-3 border-t border-blue-500">
            <span
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-blue-800"
              aria-hidden="true"
            >
              {user?.name?.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.name}</p>
              <p className="truncate text-sm text-blue-100" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
