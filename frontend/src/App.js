import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import GoogleCallback from './components/Auth/GoogleCallback';
import AuthSuccess from './components/Auth/AuthSuccess';
import AuthError from './components/Auth/AuthError';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback/" element={<GoogleCallback />} />
          <Route path="/auth/success/" element={<AuthSuccess />} />
          <Route path="/auth/error/" element={<AuthError />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
