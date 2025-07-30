import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Badge,
  Avatar,
  Switch,
  useMediaQuery,
  useTheme,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Sports,
  History,
  Person,
  Logout,
  Login,
  AddCircle,
  MonetizationOn,
  Dashboard,
  Receipt,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import AuthContext from '../../contexts/AuthContext';
import BettingContext from '../../contexts/BettingContext';

const Header = ({ onDrawerToggle, onThemeToggle, themeMode }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { bettingSlip } = useContext(BettingContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };
  
  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* Logo */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: { xs: 1, md: 0 },
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            mr: { md: 4 }
          }}
        >
          ORACLE SPORT
        </Typography>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/sports"
              startIcon={<Sports />}
              sx={{ mr: 1 }}
            >
              Deportes
            </Button>
            
            {isAuthenticated && (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/bet-history"
                  startIcon={<History />}
                  sx={{ mr: 1 }}
                >
                  Historial
                </Button>
                
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/deposit"
                  startIcon={<AddCircle />}
                  sx={{ mr: 1 }}
                >
                  Depositar
                </Button>
                
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/withdraw"
                  startIcon={<MonetizationOn />}
                  sx={{ mr: 1 }}
                >
                  Retirar
                </Button>
              </>
            )}
          </Box>
        )}
        
        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <IconButton
            color="inherit"
            onClick={onThemeToggle}
            size="small"
          >
            {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Box>
        
        {/* Betting Slip Badge */}
        {isAuthenticated && bettingSlip.length > 0 && (
          <IconButton 
            color="inherit"
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={bettingSlip.length} color="error">
              <Receipt />
            </Badge>
          </IconButton>
        )}
        
        {/* User Menu / Login Button */}
        {isAuthenticated ? (
          <Box>
            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                alt={user?.username}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {/* User Info */}
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  Saldo: {Number(user?.balance || 0).toFixed(2)} USDT
                </Typography>
              </Box>
              
              <Divider />
              
              {/* Menu Items */}
              <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mi Perfil</ListItemText>
              </MenuItem>
              
              <MenuItem component={RouterLink} to="/bet-history" onClick={handleMenuClose}>
                <ListItemIcon>
                  <History fontSize="small" />
                </ListItemIcon>
                <ListItemText>Historial de Apuestas</ListItemText>
              </MenuItem>
              
              {user?.role === 'admin' && (
                <>
                  <Divider />
                  <MenuItem component={RouterLink} to="/admin" onClick={handleMenuClose}>
                    <ListItemIcon>
                      <Dashboard fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Panel de Admin</ListItemText>
                  </MenuItem>
                </>
              )}
              
              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              startIcon={<Login />}
              variant="outlined"
              size="small"
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Iniciar Sesión
            </Button>
            
            {!isMobile && (
              <Button 
                color="secondary" 
                component={RouterLink} 
                to="/register"
                variant="contained"
                size="small"
              >
                Registrarse
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;