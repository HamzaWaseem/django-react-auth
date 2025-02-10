import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

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
    
    // Check if account is temporarily deleted
    if (response.data.user.profile?.scheduled_deletion) {
      throw new Error('Account is temporarily deleted');
    }
    
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      const userPrefs = await axios.get('/api/user/preferences/');
      localStorage.setItem('theme', userPrefs.data.theme_preference || 'light');
    }
    return response;
  } catch (error) {
    if (error.response?.data?.detail) {
      // Check if detail is an array and take the first message
      const detail = Array.isArray(error.response.data.detail) 
        ? error.response.data.detail[0] 
        : error.response.data.detail;
      throw new Error(detail);
    }
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

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

const deleteAccount = async (deletionType) => {
  const token = localStorage.getItem('token');
  return axios.post(
    '/api/user/delete-account/',
    { deletion_type: deletionType },
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

const restoreAccount = async (username) => {
  return axios.post('/api/user/restore-account/', { username });
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateTheme,
  deleteAccount,
  restoreAccount,
};

export default authService;