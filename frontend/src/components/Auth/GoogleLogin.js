import React from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleLogin = () => {
  const handleGoogleLogin = () => {
    // Implement Google login logic here
    console.log('Google login clicked');
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{ mt: 1, mb: 2 }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLogin;
