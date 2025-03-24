import React, { createContext, useState, useEffect, useContext } from "react";

// Create AuthContext
const AuthContext = createContext();

// Custom hook for using AuthContext
export const useAuth = () => useContext(AuthContext);

// Encryption helper functions
const encryptData = (data) => {
  return btoa(data); // Base64 Encoding (lightweight encryption)
};
const decryptData = (data) => {
  return atob(data); // Base64 Decoding
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    // Restore encrypted token from sessionStorage
    const encryptedToken = sessionStorage.getItem("authToken");
    return encryptedToken ? decryptData(encryptedToken) : null;
  });

  // Login function (encrypt & store)
  const loginUser = (newToken) => {
    const encryptedToken = encryptData(newToken);
    sessionStorage.setItem("authToken", encryptedToken);
    setToken(newToken);
  };

  // Logout function (remove token)
  const logoutUser = () => {
    sessionStorage.removeItem("authToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};