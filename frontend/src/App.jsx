import { HelmetProvider } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import routes
import { publicRoutes, privateRoutes } from "./utils/routes";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        {/* ToastContainer should be placed once, ideally here */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Routes>
          {/* Map through public routes */}
          {publicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Map through private routes */}
          {privateRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
