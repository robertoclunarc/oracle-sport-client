import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SportsSidebar from './SportsSidebar';
import Footer from '../common/Footer';

const Layout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Las páginas de admin no usan este layout, se manejan por separado
  const showSidebar = !isMobile; // Solo mostrar sidebar en desktop
  const showBettingPanel = true;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar solo en desktop */}
        {showSidebar && <SportsSidebar />}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: showSidebar ? '200px' : 0,
            mr: { 
              xs: 0, // En móvil no reservar espacio para betting panel
              md: showBettingPanel ? '390px' : 0 
            },
            backgroundColor: theme.palette.background.default,
            minHeight: 'calc(100vh - 64px)',
            p: 0,
            position: 'relative'
          }}
        >
          {children}
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;