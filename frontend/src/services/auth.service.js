import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add base URL if not configured in axios defaults
const API_URL = process.env.REACT_APP_API_URL || '';

const register = async (username, email, password) => {
  try {
    const response = await axios.post('/api/auth/registration/', {
      username: username,
      email: email,
      password1: password,
      password2: password,
    });
    console.log('Registration success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data);
    throw error;
  }
};

const login = async (username, password) => {
  const response = await axios.post('/api/token/', {
    username,
    password,
  });
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
  }
  return response;
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('theme');
  delete axios.defaults.headers.common['Authorization'];
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  // Add this method to your existing auth.service.js
  // Update the updateTheme method
  updateTheme(theme) {
    const token = localStorage.getItem('token');
    return axios.post('/api/user/theme/', 
      { theme_preference: theme },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }
};

export default authService;