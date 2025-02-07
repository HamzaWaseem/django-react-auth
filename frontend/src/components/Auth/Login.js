import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Link,
} from '@mui/material';
import GoogleLogin from './GoogleLogin';
import authService from '../../services/auth.service';
import RestoreAccount from './RestoreAccount';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(username, password);
      await authLogin(username, password);
      navigate('/');
    } catch (err) {
      if (err.message === 'Account is scheduled for deletion. Please restore your account to continue.') {
        setShowRestoreDialog(true);
      } else {
        const errorMessage = err.response?.data?.detail || 
                           'Failed to login. Please check your credentials.';
        setError(errorMessage);
      }
    }
  };

  const handleRestoreSuccess = async () => {
    try {
      await authLogin(username, password);
      navigate('/');
    } catch (error) {
      setError('Failed to login after restoration. Please try again.');
    }
  };

  const handleRecoverClick = () => {
    setShowRestoreDialog(true);
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
          Sign in
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Divider sx={{ my: 2 }}>OR</Divider>
          <GoogleLogin />
          <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link href="/register" variant="body2">
              Don't have an account? Register
            </Link>
            <Link 
              component="button"
              variant="body2"
              onClick={handleRecoverClick}
              sx={{ color: 'primary.main' }}
            >
              Recover Deleted Account
            </Link>
          </Box>
        </Box>
      </Box>

      <RestoreAccount
        open={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        onSuccess={handleRestoreSuccess}
      />
    </Container>
  );
};

export default Login;
