import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const register = async (username, email, password) => {
  return axios.post(API_URL + 'auth/registration/', {
    username,
    email,
    password1: password,
    password2: password,
  });
};

const login = async (username, password) => {
  const response = await axios.post(API_URL + 'token/', {
    username,
    password,
  });
  if (response.data.access) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const googleAuth = async (access_token) => {
  const response = await axios.post(API_URL + 'auth/google/', {
    access_token: access_token,
  });
  if (response.data.access) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  googleAuth,
};

export default authService;