import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('zoop_admin_token');
    const adminData = localStorage.getItem('zoop_admin_data');
    if (token && adminData) {
      setAuthToken(token);
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('zoop_admin_token', token);
    localStorage.setItem('zoop_admin_data', JSON.stringify(adminData));
    setAuthToken(token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('zoop_admin_token');
    localStorage.removeItem('zoop_admin_data');
    setAuthToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
