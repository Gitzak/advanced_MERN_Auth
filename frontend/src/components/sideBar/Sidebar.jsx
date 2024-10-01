import React, { useState, useEffect, useContext } from "react";
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

    useEffect(() => {
        const currentPath = location.pathname;
        const activeMenuItem = menuItems.find(
            (item) => item.path === currentPath
        );
        if (activeMenuItem) {
            setActiveItem(activeMenuItem.name);
        }
    }, [location.pathname]);

    const handleItemClick = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout(navigate);
    };

    return (
        <div
            className={`flex flex-col h-screen ${
                isOpen ? "w-64" : "w-20"
            } bg-blue-600 text-white transition-all duration-300`}
        >
            <div
                className={`p-5 flex ${
                    isOpen ? "justify-between" : "justify-center"
                }`}
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
                        App DATA
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
                                        className={`w-5 h-5 ${
                                            isOpen ? "mr-3" : "mx-auto"
                                        }`}
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
            <div className="border-t border-blue-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-5 py-5 transition-colors duration-200 hover:bg-blue-700"
                >
                    <LogOut
                        className={`w-5 h-5 ${isOpen ? "mr-3" : "mx-auto"}`}
                    />
                    {isOpen && <span>Log out</span>}
                </button>
            </div>

            {isOpen && (
                <div className="p-5 border-t border-blue-700">
                    <div className="flex items-center">
                        <img
                            className="w-10 h-10 rounded-full mr-3"
                            src={`https://ui-avatars.com/api/?name=z&background=random&size=40`}
                            alt="User avatar"
                        />
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-blue-300">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
