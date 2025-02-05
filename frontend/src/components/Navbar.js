import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns'; // You might need to install this package

const Navbar = () => {
  const { lastLogin } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        {/* ... existing navbar items ... */}
        {lastLogin && (
          <Typography variant="body2" sx={{ ml: 2 }}>
            Last Login: {format(new Date(lastLogin), 'MMM dd, yyyy HH:mm')}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}; 