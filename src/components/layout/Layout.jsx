import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SportsSidebar from './SportsSidebar';
import Footer from '../common/Footer';

const Layout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Páginas de admin no necesitan sidebar ni el panel de apuestas
  const isAdminPage = location.pathname.startsWith('/admin');
  const showSidebar = !isAdminPage;

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
            mr: isAdminPage ? 0 : '390px', // Espacio para el betting panel
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