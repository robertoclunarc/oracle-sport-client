import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const Loading = ({ message = 'Cargando...', size = 40 }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        p: 3
      }}
    >
      <CircularProgress 
        size={size} 
        sx={{ 
          color: theme.palette.primary.main,
          mb: 2 
        }} 
      />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;