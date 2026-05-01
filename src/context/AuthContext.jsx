/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("auth_user", JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        });
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      setToken(response.data.access_token || response.data.token || "");
      setLoading(false);
      return response;
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      setLoading(false);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", { username, email, password });
      setLoading(false);
      return response;
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};