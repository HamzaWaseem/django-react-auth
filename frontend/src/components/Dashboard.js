import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import authService from '../services/auth.service';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to Dashboard
        </Typography>
        {user && (
          <Typography sx={{ mt: 2 }}>
            Logged in as: {user.username}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;