import React from "react";
import AppRoutes from "./components/routes/routes"; // Your App Routes
import { AuthProvider } from "./contextapi"; // AuthContext import

const App = () => {
  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <AppRoutes /> {/* This renders your routes */}
    </AuthProvider>
  );
};

export default App;
