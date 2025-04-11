import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import (named export)

// Create AuthContext
const AuthContext = createContext();

// Custom hook for using AuthContext
export const useAuth = () => useContext(AuthContext);

// Encryption helper functions
const encryptData = (data) => btoa(data);
const decryptData = (data) => atob(data);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const encryptedToken = sessionStorage.getItem("authToken");
    return encryptedToken ? decryptData(encryptedToken) : null;
  });

  const logoutUser = () => {
    sessionStorage.removeItem("authToken");
    setToken(null);
    alert("Session expired. Please log in again.");
  };

  const loginUser = (newToken) => {
    const encryptedToken = encryptData(newToken);
    sessionStorage.setItem("authToken", encryptedToken);
    setToken(newToken);

    try {
      const decoded = jwtDecode(newToken);
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeLeft = expiryTime - currentTime;

      if (timeLeft <= 0) {
        logoutUser();
      } else {
        setTimeout(() => {
          logoutUser();
        }, timeLeft);
      }
    } catch (error) {
      console.error("Invalid token format", error);
      logoutUser();
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiryTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeLeft = expiryTime - currentTime;

        if (timeLeft <= 0) {
          logoutUser();
        } else {
          const timeout = setTimeout(() => {
            logoutUser();
          }, timeLeft);

          return () => clearTimeout(timeout);
        }
      } catch (error) {
        logoutUser();
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
