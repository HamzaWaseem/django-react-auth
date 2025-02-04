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

const googleLogin = async (code) => {
  return axios.post(API_URL + 'auth/google/', {
    code: code,
    redirect_uri: 'http://localhost:3000'
  });
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  googleLogin,
};

export default authService;