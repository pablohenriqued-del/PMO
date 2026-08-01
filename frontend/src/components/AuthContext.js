import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
