import React from 'react';
import { Box, useTheme } from '@mui/material';
import Header from './Header';

const AdminLayout = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
          p: 0
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;