import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search,
  Person,
  History,
  AccountBalance,
  Logout,
  Receipt,
  Dashboard
} from '@mui/icons-material';
import AuthContext from '../../contexts/AuthContext';
import BettingContext from '../../contexts/BettingContext';
import BettingSlipModal from '../betting/BettingSlipModal';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { bettingSlip } = useContext(BettingContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [bettingSlipModalOpen, setBettingSlipModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleBettingSlipClick = () => {
    setBettingSlipModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/sports?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: theme.palette.primary.main,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          <Box 
            component={RouterLink} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                🏆
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
              ORACLE SPORT
            </Typography>
          </Box>
          
          {/* Navigation Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 4 }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
                sx={{ fontWeight: 600 }}
              >
                Home
              </Button>
              
              {isAuthenticated && (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/bet-history"
                    sx={{ fontWeight: 600 }}
                  >
                    My Bets
                  </Button>
                  
                  {user?.role === 'admin' && (
                    <>
                      <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/admin"
                        sx={{ fontWeight: 600 }}
                      >
                        Dashboard
                      </Button>
                      <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/admin/manage-bets"
                        sx={{ fontWeight: 600 }}
                      >
                        Manage Bets
                      </Button>
                    </>
                  )}
                </>
              )}
            </Box>
          )}
          
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 400, mx: 2 }}>
            <form onSubmit={handleSearch}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '& input::placeholder': {
                      color: 'rgba(255,255,255,0.7)',
                    }
                  }
                }}
                fullWidth
              />
            </form>
          </Box>
          
          {/* Betting Slip Icon */}
          {isAuthenticated && bettingSlip.length > 0 && (
            <IconButton 
              color="inherit"
              onClick={handleBettingSlipClick}
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={bettingSlip.length} color="error">
                <Receipt />
              </Badge>
            </IconButton>
          )}
          
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* User Balance */}
              <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Balance
                </Typography>
                <Typography variant="body1" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                  ${Number(user?.balance || 0).toFixed(2)}
                </Typography>
              </Box>
              
              {/* User Menu */}
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    backgroundColor: theme.palette.secondary.main,
                    fontSize: '1rem'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Balance: ${Number(user?.balance || 0).toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                
                <MenuItem component={RouterLink} to="/bet-history" onClick={handleMenuClose}>
                  <ListItemIcon><History fontSize="small" /></ListItemIcon>
                  <ListItemText>My Bets</ListItemText>
                </MenuItem>

                <MenuItem component={RouterLink} to="/deposit" onClick={handleMenuClose}>
                  <ListItemIcon><AccountBalance fontSize="small" /></ListItemIcon>
                  <ListItemText>Deposit</ListItemText>
                </MenuItem>

                <MenuItem component={RouterLink} to="/withdraw" onClick={handleMenuClose}>
                  <ListItemIcon><AccountBalance fontSize="small" /></ListItemIcon>
                  <ListItemText>Withdraw</ListItemText>
                </MenuItem>
                
                {user?.role === 'admin' && (
                  <MenuItem component={RouterLink} to="/admin" onClick={handleMenuClose}>
                    <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined"
                component={RouterLink} 
                to="/login"
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                LOG IN
              </Button>
              
              <Button 
                variant="contained"
                component={RouterLink} 
                to="/register"
                sx={{ 
                  backgroundColor: theme.palette.secondary.main,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark
                  }
                }}
              >
                JOIN
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <BettingSlipModal 
        open={bettingSlipModalOpen}
        onClose={() => setBettingSlipModalOpen(false)}
      />
    </>
  );
};

export default Header;