import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Telegram,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
              ORACLE SPORT
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              La plataforma líder en apuestas deportivas. Apuesta en MLB, NBA, NFL, NHL y más con las mejores cuotas del mercado.
            </Typography>
            
            {/* Social Media */}
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="primary" aria-label="Telegram">
                <Telegram />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Enlaces Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/sports" color="text.secondary" underline="hover">
                Deportes
              </Link>
              <Link component={RouterLink} to="/deposit" color="text.secondary" underline="hover">
                Depositar
              </Link>
              <Link component={RouterLink} to="/withdraw" color="text.secondary" underline="hover">
                Retirar
              </Link>
              <Link component={RouterLink} to="/bet-history" color="text.secondary" underline="hover">
                Historial
              </Link>
            </Box>
          </Grid>

          {/* Sports */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Deportes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/sports/baseball_mlb" color="text.secondary" underline="hover">
                MLB
              </Link>
              <Link component={RouterLink} to="/sports/basketball_nba" color="text.secondary" underline="hover">
                NBA
              </Link>
              <Link component={RouterLink} to="/sports/americanfootball_nfl" color="text.secondary" underline="hover">
                NFL
              </Link>
              <Link component={RouterLink} to="/sports/icehockey_nhl" color="text.secondary" underline="hover">
                NHL
              </Link>
              <Link component={RouterLink} to="/sports/soccer" color="text.secondary" underline="hover">
                Fútbol
              </Link>
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="text.secondary" underline="hover">
                Términos y Condiciones
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Política de Privacidad
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Juego Responsable
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Política de Cookies
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  soporte@oraclesport.com
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Atención 24/7
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Oracle Sport. Todos los derechos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Licencia: #OSP-2024-001
            </Typography>
            <Typography variant="body2" color="text.secondary">
              18+ Juegue con responsabilidad
            </Typography>
          </Box>
        </Box>

        {/* Disclaimer */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Oracle Sport es una plataforma de entretenimiento para mayores de 18 años. 
            Las apuestas deportivas pueden ser adictivas, juegue con responsabilidad. 
            Si tiene problemas con el juego, busque ayuda profesional.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;