import React, { useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react"; // You can use any icon for the close button

const Alert = ({ type = "danger", title, content }) => {
  const [isVisible, setIsVisible] = useState(true); // Manage alert visibility

  // Define the class styles based on the type prop
  const alertStyles = {
    danger: {
      border: "border-red-500",
      bg: "bg-red-50",
      text: "text-red-800",
      iconColor: "text-red-800",
      iconPath:
        "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
    },
    info: {
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-800",
      iconColor: "text-blue-800",
      iconPath:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm1-10H11v5h2V7z", // Info icon
    },
    success: {
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-800",
      iconColor: "text-green-800",
      iconPath:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.59l-3.29-3.29 1.41-1.41 1.88 1.88 4.88-4.88 1.41 1.41L10 16.59z", // Success icon
    },
    warning: {
      border: "border-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-800",
      iconColor: "text-orange-800",
      iconPath:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z", // Warning icon
    },
    dark: {
      border: "border-gray-700",
      bg: "bg-gray-800",
      text: "text-gray-300",
      iconColor: "text-gray-300",
      iconPath:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15h-2v-2h2v2zm0-4h-2V7h2v6z", // Dark icon
    },
  };

  const currentStyle = alertStyles[type];

  if (!isVisible) {
    return null; // Return null if the alert is closed
  }

  return (
    <div
      role="alert"
      className={`rounded border-s-4 ${currentStyle.border} ${currentStyle.bg} p-4 relative mb-5`}
    >
      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setIsVisible(false)}
      >
        <X size={20} />
      </button>

      <div className={`flex items-center gap-2 ${currentStyle.text}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 ${currentStyle.iconColor}`}
        >
          <path
            fillRule="evenodd"
            d={currentStyle.iconPath}
            clipRule="evenodd"
          />
        </svg>

        <strong className="block font-medium">{title}</strong>
      </div>

      <p className={`mt-2 text-sm ${currentStyle.text}`}>{content}</p>
    </div>
  );
};

// Define PropTypes for validation
Alert.propTypes = {
  type: PropTypes.oneOf(["danger", "info", "success", "warning", "dark"]),
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default Alert;
