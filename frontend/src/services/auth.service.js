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
  try {
    const response = await axios.post('/api/token/', {
      username,
      password,
    });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      // Set the authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Fetch user preferences after successful login
      const userPrefs = await axios.get('/api/user/preferences/', {
        headers: { Authorization: `Bearer ${response.data.access}` }
      });
      localStorage.setItem('theme', userPrefs.data.theme_preference || 'light');
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

// Add new function to update theme
const updateTheme = async (theme) => {
  const token = localStorage.getItem('token');
  return axios.patch(
    '/api/user/preferences/',
    { theme_preference: theme },
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateTheme,
};

export default authService;