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
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton
} from '@mui/material';
import {
  Search,
  Person,
  History,
  Logout,
  Receipt,
  Dashboard,
  Menu as MenuIcon,
  Close,
  Home,
  AccountBalanceWallet, AccountBalance,
  TrendingUp,
  TrendingDown,
  AdminPanelSettings
} from '@mui/icons-material';
import AuthContext from '../../contexts/AuthContext';
import BettingContext from '../../contexts/BettingContext';
import BettingSlipModal from '../betting/BettingSlipModal';
import SportsSidebar from './SportsSidebar';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { bettingSlip } = useContext(BettingContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [bettingSlipModalOpen, setBettingSlipModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
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
        <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
          {/* Menú hamburguesa (solo móvil) */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={toggleMobileMenu}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box 
            component={RouterLink} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: { xs: 1, md: 4 }
            }}
          >
            <Box
              sx={{
                width: { xs: 32, md: 40 },
                height: { xs: 32, md: 40 },
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                🏆
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontSize: { xs: '1rem', md: '1.25rem' },
              display: { xs: 'none', sm: 'block' }
            }}>
              ORACLE SPORT
            </Typography>
          </Box>
          
          {/* Navigation Menu (solo desktop) */}
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
                      <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/admin/manage-users"
                        sx={{ fontWeight: 600 }}
                      >
                        Manage Users
                      </Button>
                    </>
                  )}
                </>
              )}
            </Box>
          )}
          
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: { xs: 200, md: 400 }, mx: { xs: 1, md: 2 } }}>
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
                    fontSize: { xs: '0.875rem', md: '1rem' },
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
              sx={{ mr: { xs: 0.5, md: 2 } }}
            >
              <Badge badgeContent={bettingSlip.length} color="error">
                <Receipt />
              </Badge>
            </IconButton>
          )}
          
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* User Balance (solo desktop) */}
              {!isMobile && (
                <Box sx={{ textAlign: 'right', mr: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Balance
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                    ${Number(user?.balance || 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              {/* User Menu */}
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar 
                  sx={{ 
                    width: { xs: 28, md: 32 }, 
                    height: { xs: 28, md: 32 }, 
                    backgroundColor: theme.palette.secondary.main,
                    fontSize: { xs: '0.875rem', md: '1rem' }
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
                  <ListItemIcon><AccountBalanceWallet fontSize="small" /></ListItemIcon>
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
            <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 } }}>
              <Button 
                variant="outlined"
                component={RouterLink} 
                to="/login"
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
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
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  backgroundColor: theme.palette.secondary.main,
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
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

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header del drawer */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {/* Información del usuario (si está logueado) */}
          {isAuthenticated && (
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar 
                  sx={{ 
                    backgroundColor: theme.palette.secondary.main,
                    fontSize: '1rem'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Balance: ${Number(user?.balance || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Navegación principal */}
          <List sx={{ flexGrow: 1 }}>
            {/* Home */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMobileNavigation('/')}>
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>

            {/* My Bets (solo si está autenticado) */}
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileNavigation('/bet-history')}>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText primary="My Bets" />
                </ListItemButton>
              </ListItem>
            )}

            {/* Profile (solo si está autenticado) */}
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleMobileNavigation('/profile')}>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </ListItem>
            )}

            <Divider />

            {/* Sección financiera (solo si está autenticado) */}
            {isAuthenticated && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMobileNavigation('/deposit')}>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Deposit" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMobileNavigation('/withdraw')}>
                    <ListItemIcon>
                      <TrendingDown color="warning" />
                    </ListItemIcon>
                    <ListItemText primary="Withdraw" />
                  </ListItemButton>
                </ListItem>

                <Divider />
              </>
            )}

            {/* Admin Dashboard (solo para admins) */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMobileNavigation('/admin')}>
                    <ListItemIcon>
                      <AdminPanelSettings color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Admin Dashboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMobileNavigation('/admin/manage-bets')}>
                    <ListItemIcon>
                      <AdminPanelSettings color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Manage Bets" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMobileNavigation('/admin/manage-users')}>
                    <ListItemIcon>
                      <AdminPanelSettings color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Manage Users" />
                  </ListItemButton>
                </ListItem>
              </>  
            )}
          </List>

          {/* Sports Sidebar */}
          <Divider />
          <SportsSidebar isMobile onClose={() => setMobileMenuOpen(false)} />

          {/* Logout o Login/Register */}
          <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
            {isAuthenticated ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Logout />}
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                color="error"
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleMobileNavigation('/login')}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleMobileNavigation('/register')}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      <BettingSlipModal 
        open={bettingSlipModalOpen}
        onClose={() => setBettingSlipModalOpen(false)}
      />
    </>
  );
};

export default Header;