import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedLastLogin = localStorage.getItem('lastLogin');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedLastLogin) {
      setLastLogin(storedLastLogin);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.user.last_login) {
        setLastLogin(response.data.user.last_login);
        localStorage.setItem('lastLogin', response.data.user.last_login);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setLastLogin(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
  };

  const value = {
    user,
    login,
    logout,
    lastLogin,
    setLastLogin,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 