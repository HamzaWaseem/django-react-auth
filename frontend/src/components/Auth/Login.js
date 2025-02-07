import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';  // Add this import
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Dialog,              // Add these
  DialogActions,       // Material-UI
  DialogContent,       // Dialog
  DialogContentText,   // components
  DialogTitle,         // imports
} from '@mui/material';
import GoogleLogin from './GoogleLogin';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      if (error.response?.data?.detail === 'Account is temporarily deleted') {
        setError('This account is temporarily deleted. Use the recovery option to restore it.');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const handleRecovery = async () => {
    try {
      await authService.restoreAccount(recoveryUsername);
      setRecoveryDialogOpen(false);
      setError('Account restored successfully. You can now login.');
    } catch (error) {
      setError('Failed to restore account. Please try again.');
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
        </Box>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="text"
          onClick={() => setRecoveryDialogOpen(true)}
        >
          Recover Deleted Account
        </Button>
      </Box>

      <Dialog open={recoveryDialogOpen} onClose={() => setRecoveryDialogOpen(false)}>
        <DialogTitle>Recover Deleted Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your username to restore your temporarily deleted account.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={recoveryUsername}
            onChange={(e) => setRecoveryUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecoveryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRecovery}>Recover Account</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
