import React, { createContext, useContext, useState, useEffect } from "react";

import axios from "../axiosConfig";
// Create a Context for the auth state
const AuthContext = createContext();

// Provide AuthContext to components
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  // Function to verify user session
  const verifySession = async () => {
    try {
      const response = await axios.get("/auth/me", { withCredentials: true });
      //console.log("✅ Réponse reçue de /auth/me :", response.data);
      setUser(response.data); // Set user data on successful verification
      //console.log("VerifySession");
      //console.log("data:", response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error verifying user session:", error);
      }
      //console.error("Error verifying user session:", error);
      setUser(null); // Ensure user is set to null if session is not valid
    } finally {
      setLoading(false); // End loading
    }
  };
  useEffect(() => {
    verifySession();
  }, []);
  // Mock login function
  const login = async (email, password) => {
    console.log(user);
    try {
      const response = await axios.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data);
      return true;
    } catch (error) {
      console.error("Error logging in:", error);
      return false;
    }
  };

  // Mock logout function
  const logout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
