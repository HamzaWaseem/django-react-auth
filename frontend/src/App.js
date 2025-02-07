import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { Routes, Route } from 'react-router-dom';

function App() {
  const { theme } = useAuth();
  
  const appTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: theme === 'dark' ? '#90caf9' : '#1976d2',
      },
      background: {
        default: theme === 'dark' ? '#121212' : '#fff',
        paper: theme === 'dark' ? '#1e1e1e' : '#fff',
      },
    },
  });

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <div style={{ minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
