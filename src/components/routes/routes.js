import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../login";
import SignupPage from "../signup";
import AdminPortal from "../sider/sider"; // Your admin portal component
import ProtectedRoute from "./protectedroute"; // Import ProtectedRoute

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Protect /myadmin route */}
        <Route
          path="/myadmin"
          element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LoginPage />} /> {/* Default route */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
