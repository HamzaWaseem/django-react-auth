import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';  // Add this import
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedLastLogin = localStorage.getItem('lastLogin');
    const storedTheme = localStorage.getItem('theme');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    if (storedLastLogin) {
      setLastLogin(storedLastLogin);
    }
    if (storedTheme) {
      setTheme(storedTheme);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setLastLogin(null);
    setTheme('light'); // Reset theme to light
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('theme');
    localStorage.removeItem('token');
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (user) {
      try {
        await authService.updateTheme(newTheme);
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set the token in axios headers
      if (response.data.access) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      
      if (response.data.user.last_login) {
        setLastLogin(response.data.user.last_login);
        localStorage.setItem('lastLogin', response.data.user.last_login);
      }
      
      // Load user's theme preference if available
      if (response.data.user.theme_preference) {
        setTheme(response.data.user.theme_preference);
        localStorage.setItem('theme', response.data.user.theme_preference);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    lastLogin,
    setLastLogin,
    loading,
    theme,
    toggleTheme,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);