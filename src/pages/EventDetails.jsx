import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack,
  Schedule,
  Sports,
  TrendingUp,
  Home as HomeIcon
} from '@mui/icons-material';
import { getEvent } from '../api/sports';
import BettingContext from '../contexts/BettingContext';
import AuthContext from '../contexts/AuthContext';
import Loading from '../components/common/Loading';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventDetails = () => {
  const { eventId } = useParams();
  const { addToBettingSlip } = useContext(BettingContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (err) {
        setError('Error al cargar los detalles del evento');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const organizeOdds = (odds) => {
    const organized = {
      h2h: {},
      spread: {},
      totals: {}
    };

    odds?.forEach(odd => {
      if (odd.market_type === 'h2h') {
        organized.h2h[odd.outcome_name] = {
          id: odd.id,
          price: odd.price
        };
      } else if (odd.market_type === 'spread') {
        organized.spread[odd.outcome_name] = {
          id: odd.id,
          price: odd.price,
          handicap: odd.handicap
        };
      } else if (odd.market_type === 'totals') {
        organized.totals[odd.outcome_name] = {
          id: odd.id,
          price: odd.price,
          total: odd.total
        };
      }
    });

    return organized;
  };

  const handleBetClick = (oddsData, betType, selection, description) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const betItem = {
      id: `${event.id}-${betType}-${selection}`,
      eventId: event.id,
      oddsId: oddsData.id,
      matchup: `${event.away_team} @ ${event.home_team}`,
      league: event.sport || event.competition,
      selection: description,
      price: oddsData.price,
      marketType: betType,
      eventTime: event.commence_time
    };

    addToBettingSlip(betItem);
  };

  const formatOdds = (price) => {
    const odds = parseFloat(price);
    return odds >= 0 ? `+${odds}` : odds.toString();
  };

  if (loading) {
    return <Loading message="Cargando detalles del evento..." />;
  }

  if (error || !event) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Evento no encontrado'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/sports')}
          sx={{ mt: 2 }}
        >
          Volver a Deportes
        </Button>
      </Container>
    );
  }

  const eventTime = new Date(event.commence_time);
  const formattedTime = format(eventTime, 'EEEE, dd MMMM yyyy - HH:mm', { locale: es });
  const organizedOdds = organizeOdds(event.odds);

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3, mt: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Inicio
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          onClick={() => navigate('/sports')}
          sx={{ cursor: 'pointer' }}
        >
          Deportes
        </Link>
        <Typography color="text.primary">
          {event.away_team} vs {event.home_team}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Información del evento */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip 
                  icon={<Sports />}
                  label={event.sport || event.competition} 
                  color="primary" 
                  variant="outlined"
                />
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/sports')}
                  variant="outlined"
                  size="small"
                >
                  Volver
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {event.away_team}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  vs
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {event.home_team}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {formattedTime}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Mercados de apuestas */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Mercados de Apuestas
            </Typography>

            {/* Money Line */}
            {organizedOdds.h2h && Object.keys(organizedOdds.h2h).length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Ganador del Partido
                  </Typography>
                  <Grid container spacing={2}>
                    {organizedOdds.h2h.away && (
                      <Grid item xs={12} sm={organizedOdds.h2h.draw ? 4 : 6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.h2h.away,
                            'h2h',
                            'away',
                            `${event.away_team} gana`
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {event.away_team}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.h2h.away.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}

                    {organizedOdds.h2h.draw && (
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.h2h.draw,
                            'h2h',
                            'draw',
                            'Empate'
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Empate
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.h2h.draw.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}

                    {organizedOdds.h2h.home && (
                      <Grid item xs={12} sm={organizedOdds.h2h.draw ? 4 : 6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.h2h.home,
                            'h2h',
                            'home',
                            `${event.home_team} gana`
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {event.home_team}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.h2h.home.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Spread */}
            {organizedOdds.spread && Object.keys(organizedOdds.spread).length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Hándicap de Puntos
                  </Typography>
                  <Grid container spacing={2}>
                    {organizedOdds.spread.away && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.spread.away,
                            'spread',
                            'away',
                            `${event.away_team} ${organizedOdds.spread.away.handicap > 0 ? '+' : ''}${organizedOdds.spread.away.handicap}`
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {event.away_team}
                            </Typography>
                            <Typography variant="body2">
                              {organizedOdds.spread.away.handicap > 0 ? '+' : ''}{organizedOdds.spread.away.handicap}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.spread.away.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}

                    {organizedOdds.spread.home && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.spread.home,
                            'spread',
                            'home',
                            `${event.home_team} ${organizedOdds.spread.home.handicap > 0 ? '+' : ''}${organizedOdds.spread.home.handicap}`
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {event.home_team}
                            </Typography>
                            <Typography variant="body2">
                              {organizedOdds.spread.home.handicap > 0 ? '+' : ''}{organizedOdds.spread.home.handicap}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.spread.home.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Totals */}
            {organizedOdds.totals && Object.keys(organizedOdds.totals).length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Total de Puntos
                  </Typography>
                  <Grid container spacing={2}>
                    {organizedOdds.totals.over && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.totals.over,
                            'totals',
                            'over',
                            `Over ${organizedOdds.totals.over.total}`
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Over
                            </Typography>
                            <Typography variant="body2">
                              {organizedOdds.totals.over.total}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.totals.over.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}

                    {organizedOdds.totals.under && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="large"
                          onClick={() => handleBetClick(
                            organizedOdds.totals.under,
                            'totals',
                            'under',
                            `Under ${organizedOdds.totals.under.total}`
                          )}
                          sx={{ 
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Under
                            </Typography>
                            <Typography variant="body2">
                              {organizedOdds.totals.under.total}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatOdds(organizedOdds.totals.under.price)}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography>
                  Para realizar apuestas debes{' '}
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/login')}
                    sx={{ textDecoration: 'underline' }}
                  >
                    iniciar sesión
                  </Button>
                  {' '}o{' '}
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/register')}
                    sx={{ textDecoration: 'underline' }}
                  >
                    crear una cuenta
                  </Button>
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Sidebar con información adicional */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Información del Evento
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Deporte
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {event.sport || event.competition}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha y Hora
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formattedTime}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Chip 
                label="Próximo" 
                color="success" 
                variant="outlined" 
                size="small"
              />
            </Box>

            {/* Información adicional */}
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Las cuotas pueden cambiar hasta el inicio del evento
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails;