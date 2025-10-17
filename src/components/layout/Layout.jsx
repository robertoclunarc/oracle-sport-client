import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SportsSidebar from './SportsSidebar';
import Footer from '../common/Footer';

const Layout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Las páginas de admin no usan este layout, se manejan por separado
  const showSidebar = true; // Siempre mostrar sidebar para rutas no-admin
  const showBettingPanel = true; // Siempre mostrar betting panel para rutas no-admin

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {showSidebar && <SportsSidebar />}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: showSidebar ? '200px' : 0,
            mr: showBettingPanel ? '390px' : 0, // Espacio para el betting panel
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