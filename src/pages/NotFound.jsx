import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center'
        }}
      >
        <Paper
          sx={{
            p: 6,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom>
            Página no encontrada
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/"
              startIcon={<Home />}
            >
              Ir al Inicio
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
              startIcon={<ArrowBack />}
            >
              Volver Atrás
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;