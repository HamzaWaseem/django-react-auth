import React from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = () => {
  const { user, lastLogin, theme, toggleTheme, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        {user ? (
          <>
            <IconButton
              sx={{ mr: 2 }}
              onClick={toggleTheme}
              color="inherit"
              aria-label="toggle theme"
            >
              {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welcome, {user.username}
            </Typography>
            {lastLogin && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                Last Login: {format(new Date(lastLogin), 'MMM dd, yyyy HH:mm')}
              </Typography>
            )}
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My App
            </Typography>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;