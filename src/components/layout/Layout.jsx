import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SportsSidebar from './SportsSidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Páginas que no necesitan sidebar
  const noSidebarPages = ['/login', '/register', '/admin'];
  const showSidebar = !noSidebarPages.some(page => location.pathname.startsWith(page));

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
            backgroundColor: theme.palette.background.default,
            minHeight: 'calc(100vh - 64px)',
            p: 0
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