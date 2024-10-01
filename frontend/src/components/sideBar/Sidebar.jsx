import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Calendar,
  BarChart2,
  FileText,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AuthContext from "../../context/AuthContext";

const menuItems = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Messages", icon: MessageSquare, path: "/messages", count: 3 },
  { name: "Order", icon: ShoppingCart, path: "/order" },
  { name: "Calendar", icon: Calendar, path: "/calendar" },
  { name: "Static", icon: BarChart2, path: "/static" },
  { name: "Documents", icon: FileText, path: "/documents" },
  { name: "Chat", icon: MessageCircle, path: "/chat" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // Use the navigate hook
  const { logout } = useContext(AuthContext); // Get the logout function from context
  const [activeItem, setActiveItem] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find((item) => item.path === currentPath);
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.name);
    }
  }, [location.pathname]);

  const handleItemClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout(navigate); // Pass the navigate function to logout
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isOpen ? "w-64" : "w-20"
      } bg-blue-600 text-white transition-all duration-300`}
    >
      <div
        className={`p-5 flex ${isOpen ? "justify-between" : "justify-center"}`}
      >
        {isOpen && (
          <h1 className="text-2xl font-bold flex items-center">
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
            TailGrids
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  {isOpen && (
                    <>
                      {item.name}
                      {item.count && (
                        <span className="ml-auto bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-medium">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="border-t border-blue-700">
        <button
          onClick={handleLogout} // Call the handleLogout function that passes navigate
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
              src="/placeholder.svg?height=40&width=40"
              alt="User avatar"
            />
            <div>
              <p className="font-medium">Musharof</p>
              <p className="text-sm text-blue-300">hello@tailgrids.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
