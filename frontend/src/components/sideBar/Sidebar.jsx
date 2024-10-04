import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import AuthContext from "../../context/AuthContext";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Profile", icon: User, path: "/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeItem, setActiveItem] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef(null); // Reference for detecting clicks outside sidebar
  const [isMobile, setIsMobile] = useState(false); // Track if the screen size is mobile

  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find((item) => item.path === currentPath);
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.name);
    }
  }, [location.pathname]);

  // Handle closing sidebar on mobile devices
  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false); // Close sidebar only on mobile
    }
  };

  const handleLogout = () => {
    logout(navigate);
    if (isMobile) {
      setIsOpen(false); // Close sidebar only on mobile
    }
  };

  // Detect clicks outside the sidebar and close if on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isMobile
      ) {
        setIsOpen(false); // Close only on mobile
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  // Update the isMobile state based on the window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Use the `md` breakpoint (768px)
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`flex flex-col h-screen ${
        isOpen ? "w-auto" : "w-20"
      } bg-blue-600 text-white transition-all duration-300`}
    >
      <div
        className={`p-5 flex ${isOpen ? "justify-between" : "justify-center"}`}
      >
        {isOpen && (
          <h1 className="text-xl font-bold flex items-center">
            <svg
              className="w-8 h-8 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            App DATA
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 ${isOpen ? "ml-5" : "ml-0"} rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400`}
        >
          {isOpen ? (
            <ChevronLeft className="w-6 h-6" />
          ) : (
            <ChevronRight className="w-6 h-6" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <Link to={item.path}>
                <button
                  onClick={() => handleItemClick(item.path)}
                  className={`flex items-center w-full px-5 py-2 transition-colors duration-200 ${
                    activeItem === item.name
                      ? "bg-blue-700"
                      : "hover:bg-blue-700"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isOpen ? "mr-3" : "mx-auto"}`}
                  />
                  {isOpen && item.name}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-5 py-5 transition-colors duration-200 hover:bg-blue-700"
        >
          <LogOut className={`w-5 h-5 ${isOpen ? "mr-3" : "mx-auto"}`} />
          {isOpen && <span>Log out</span>}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 border-t border-blue-700">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-3"
              src={`https://ui-avatars.com/api/?name=${user?.name?.slice(
                0,
                1
              )}&background=00CCDD&color=3C3D37&font-size=0.55`}
              alt="User avatar"
            />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-blue-300">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
