import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      
      console.log('Attempting registration with:', { username, email, password });
      
      const response = await authService.register(username, email, password);
      console.log('Registration response:', response);
      
      navigate('/login');
    } catch (err) {
      console.error('Registration error details:', err.response?.data);
      const errorData = err.response?.data || {};
      
      const errorMessages = [];
      Object.keys(errorData).forEach(key => {
        const error = errorData[key];
        if (Array.isArray(error)) {
          errorMessages.push(`${key}: ${error.join(', ')}`);
        } else if (typeof error === 'string') {
          errorMessages.push(`${key}: ${error}`);
        }
      });
      
      setError(errorMessages.join('\n') || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        {error && (
          <Typography 
            color="error" 
            sx={{ mt: 2, whiteSpace: 'pre-line' }}
          >
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Password must be at least 8 characters long"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
