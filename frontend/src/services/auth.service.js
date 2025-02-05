import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Remove unused API_URL variable
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
  const response = await axios.post('/api/auth/login/', {
    username,
    password,
  });
  
  if (response.data) {
    // Make sure the response includes the last_login field
    const userData = response.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }
  return null;
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

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;