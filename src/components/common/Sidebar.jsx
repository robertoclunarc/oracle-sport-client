import React, { useContext } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home,
  Sports,
  History,
  Person,
  AddCircle,
  MonetizationOn,
  Dashboard,
  People,
  Receipt,
  Settings,
  Login,
  PersonAdd
} from '@mui/icons-material';
import AuthContext from '../../contexts/AuthContext';
import BettingContext from '../../contexts/BettingContext';

const DRAWER_WIDTH = 280;

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { bettingSlip } = useContext(BettingContext);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Menu items for different user types
  const guestMenuItems = [
    { text: 'Inicio', icon: <Home />, path: '/' },
    { text: 'Deportes', icon: <Sports />, path: '/sports' },
    { text: 'Iniciar Sesión', icon: <Login />, path: '/login' },
    { text: 'Registrarse', icon: <PersonAdd />, path: '/register' },
  ];

  const userMenuItems = [
    { text: 'Inicio', icon: <Home />, path: '/' },
    { text: 'Deportes', icon: <Sports />, path: '/sports' },
    { text: 'Mi Perfil', icon: <Person />, path: '/profile' },
    { text: 'Historial', icon: <History />, path: '/bet-history' },
    { 
      text: 'Depositar', 
      icon: <AddCircle />, 
      path: '/deposit',
      color: 'success.main'
    },
    { 
      text: 'Retirar', 
      icon: <MonetizationOn />, 
      path: '/withdraw',
      color: 'warning.main'
    },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Usuarios', icon: <People />, path: '/admin/users' },
    { text: 'Apuestas', icon: <Receipt />, path: '/admin/bets' },
    { text: 'Configuración', icon: <Settings />, path: '/admin/settings' },
  ];

  const getMenuItems = () => {
    if (!isAuthenticated) return guestMenuItems;
    
    let items = [...userMenuItems];
    
    if (user?.role === 'admin') {
      items.push({ divider: true });
      items.push(...adminMenuItems);
    }
    
    return items;
  };

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Info Section */}
      {isAuthenticated && (
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {user?.username}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              Saldo: {user?.balance?.toFixed(2)} USDT
            </Typography>
            {user?.role === 'admin' && (
              <Chip 
                label="Admin" 
                size="small" 
                sx={{ 
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  fontSize: '0.7rem'
                }} 
              />
            )}
          </Box>
        </Box>
      )}

      {/* Betting Slip Info */}
      {isAuthenticated && bettingSlip.length > 0 && (
        <Box sx={{ p: 2, backgroundColor: 'success.light' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Boleto de Apuestas
          </Typography>
          <Typography variant="body2">
            {bettingSlip.length} selección{bettingSlip.length !== 1 ? 'es' : ''}
          </Typography>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Divider 
                key={`divider-${index}`} 
                sx={{ my: 1 }} 
              />
            );
          }

          const isActive = isActiveRoute(item.path);

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive}
                onClick={isMobile ? onDrawerToggle : undefined}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? 'primary.contrastText' : (item.color || 'inherit'),
                    minWidth: 40 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'bold' : 'normal',
                    fontSize: '0.9rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Oracle Sport v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          © 2024 Todos los derechos reservados
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              position: 'relative',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;