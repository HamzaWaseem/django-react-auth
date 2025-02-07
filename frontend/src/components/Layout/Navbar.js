import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';  // Add this import
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import { format } from 'date-fns';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletionType, setDeletionType] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount(deletionType);
      handleClose();
      // Logout user for both temporary and permanent deletion
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
    setDeleteDialogOpen(false);
  };

  const openDeleteDialog = (type) => {
    setDeletionType(type);
    setDeleteDialogOpen(true);
  };

  const formatLastLogin = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Your App
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.username[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={toggleTheme}>
                  <ListItemIcon>
                    {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                  </ListItemIcon>
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
                {user.last_login && (
                  <MenuItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    Last Login: {formatLastLogin(user.last_login)}
                  </MenuItem>
                )}
                {user.profile?.last_login_ip && (
                  <MenuItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    Last IP: {user.profile.last_login_ip}
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => openDeleteDialog('temporary')}>
                  <ListItemIcon>
                    <DeleteOutlineIcon />
                  </ListItemIcon>
                  Temporary Delete
                </MenuItem>
                <MenuItem onClick={() => openDeleteDialog('permanent')}>
                  <ListItemIcon>
                    <DeleteForeverIcon />
                  </ListItemIcon>
                  Permanent Delete
                </MenuItem>
                <MenuItem onClick={logout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>

              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
              >
                <DialogTitle>
                  {deletionType === 'permanent' 
                    ? 'Permanent Account Deletion' 
                    : 'Temporary Account Deletion'}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {deletionType === 'permanent'
                      ? 'Are you sure you want to permanently delete your account? This action cannot be undone.'
                      : 'Your account will be scheduled for deletion and can be restored within the grace period. Do you want to proceed?'}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleDeleteAccount} color="error">
                    Delete Account
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
