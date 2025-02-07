import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  TextField,
  Box 
} from '@mui/material';
import authService from '../../services/auth.service';

const RestoreAccount = ({ open, onClose, onSuccess }) => {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRestore = async () => {
    try {
      // Call restoreAccount with credentials
      await authService.restoreAccount(username, password);
      onSuccess();
      onClose();
      // Reset form
      setUsername('');
      setPassword('');
      setError('');
    } catch (error) {
      setError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Failed to restore account. Please check your credentials.'
      );
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Restore Deleted Account</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please enter your credentials to restore your deleted account.
        </DialogContentText>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          {error && (
            <DialogContentText color="error">
              {error}
            </DialogContentText>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleRestore} 
          color="primary"
          disabled={!username || !password}
        >
          Restore Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreAccount; 