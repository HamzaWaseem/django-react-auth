import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedLastLogin = localStorage.getItem('lastLogin');
    const storedTheme = localStorage.getItem('theme');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedLastLogin) {
      setLastLogin(storedLastLogin);
    }
    if (storedTheme) {
      setTheme(storedTheme);
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

      // Set theme from user preferences
      if (response.data.user.theme_preference) {
        setTheme(response.data.user.theme_preference);
        localStorage.setItem('theme', response.data.user.theme_preference);
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
    // Reset theme to default on logout
    setTheme('light');
    localStorage.setItem('theme', 'light');
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      await authService.updateTheme(newTheme);
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to update theme:', error);
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
    toggleTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 