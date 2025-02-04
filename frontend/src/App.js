import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import GoogleCallback from './components/Auth/GoogleCallback';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/google-callback" element={<GoogleCallback />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
