import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Paper,
  Divider,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  SportsSoccer, 
  SportsBasketball, 
  SportsBaseball, 
  SportsHockey 
} from '@mui/icons-material';
import { getSports, getEvents } from '../api/sports';
import AuthContext from '../contexts/AuthContext';
import EventCard from '../components/sports/EventCard';
import Loading from '../components/common/Loading';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [sports, setSports] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener deportes
        const sportsData = await getSports();
        setSports(sportsData);
        
        // Obtener eventos destacados
        const events = await getEvents(); // Sin parámetro para obtener eventos de todos los deportes
        setFeaturedEvents(events.slice(0, 6)); // Mostrar solo los primeros 6 eventos
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Mapeo de iconos por deporte
  const sportIcons = {
    'Soccer': <SportsSoccer fontSize="large" />,
    'Basketball': <SportsBasketball fontSize="large" />,
    'Baseball': <SportsBaseball fontSize="large" />,
    'Ice Hockey': <SportsHockey fontSize="large" />
  };

  // Filtrar deportes principales
  const mainSports = sports.filter(sport => 
    ['Soccer', 'Basketball', 'Baseball', 'Ice Hockey'].includes(sport.group)
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      {/* Banner principal */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'primary.dark',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: 'url(/assets/hero-bg.jpg)',
          p: { xs: 3, md: 6 },
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Grid container>
          <Grid item xs={12} md={6} position="relative">
            <Typography
              component="h1"
              variant="h3"
              color="inherit"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              ORACLE SPORT
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              La mejor plataforma para apostar en deportes. Béisbol, fútbol, baloncesto
              y hockey NHL. ¡Empieza a ganar ahora!
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to={isAuthenticated ? "/sports" : "/register"}
              sx={{ mt: 2 }}
            >
              {isAuthenticated ? "Ver Eventos" : "Registrarse"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Categorías de deportes */}
      <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
        Deportes Principales
      </Typography>
      <Grid container spacing={3} mb={6}>
        {mainSports.map((sport) => (
          <Grid item xs={6} sm={3} key={sport.key}>
            <Card
              component={RouterLink}
              to={`/sports/${sport.key}`}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardActionArea sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                  }}
                >
                  <Box color="primary.main" mb={2}>
                    {sportIcons[sport.group] || <SportsSoccer fontSize="large" />}
                  </Box>
                  <Typography variant="h6" component="h3" align="center">
                    {sport.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {sport.description}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Eventos destacados */}
      <Box mb={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Eventos Destacados
          </Typography>
          <Button 
            variant="outlined" 
            component={RouterLink} 
            to="/sports"
          >
            Ver Todos
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {featuredEvents.length > 0 ? (
            featuredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                No hay eventos disponibles en este momento.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* Información de la plataforma */}
      <Paper sx={{ p: 4, mb: 6, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Sobre Oracle Sport
        </Typography>
        <Typography variant="body1" paragraph>
          Oracle Sport es tu plataforma confiable para apuestas deportivas, con cobertura completa
          de los principales eventos de béisbol de las Grandes Ligas, fútbol internacional,
          baloncesto NBA y hockey NHL.
        </Typography>
        <Grid container spacing={4} mt={2}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Depósitos Seguros
              </Typography>
              <Typography variant="body2">
                Múltiples métodos de pago incluyendo transferencia bancaria, pago móvil y Binance.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Cuotas Competitivas
              </Typography>
              <Typography variant="body2">
                Ofrecemos las mejores cuotas del mercado, actualizadas en tiempo real.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Retiros Rápidos
              </Typography>
              <Typography variant="body2">
                Procesos de retiro eficientes para que disfrutes de tus ganancias sin demoras.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Llamada a la acción final */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 5,
          backgroundColor: 'primary.light',
          borderRadius: 2,
          color: 'white'
        }}
      >
        <Typography variant="h4" gutterBottom>
          ¿Listo para comenzar?
        </Typography>
        <Typography variant="body1" paragraph>
          Únete a miles de usuarios que ya están ganando con Oracle Sport.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={RouterLink}
          to={isAuthenticated ? "/sports" : "/register"}
          sx={{ mt: 2 }}
        >
          {isAuthenticated ? "Ver Eventos Deportivos" : "Crear Cuenta Ahora"}
        </Button>
      </Box>
    </Container>
  );
};

export default Home;