import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { getSports, getEvents } from '../api/sports';
import EventCard from '../components/sports/EventCard';
import BettingContext from '../contexts/BettingContext';
import AuthContext from '../contexts/AuthContext';
import BettingSlip from '../components/betting/BettingSlip';
import Loading from '../components/common/Loading';

const Sports = () => {
  const { sportKey } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const { bettingSlip } = useContext(BettingContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sports, setSports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState(sportKey || 'all');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  
  // Cargar deportes y eventos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar deportes (opcional, los extraeremos de los eventos)
        try {
          const sportsData = await getSports();
          setSports(sportsData);
        } catch (sportsError) {
          console.warn('No se pudieron cargar deportes desde la API:', sportsError);
        }
        
        // Cargar eventos (todos los eventos inicialmente)
        const eventsData = await getEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        
        //console.log('Eventos cargados:', eventsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Actualizar selectedSport cuando cambie el parámetro de la URL
  useEffect(() => {
    setSelectedSport(sportKey || 'all');
  }, [sportKey]);
  
  // Filtrar y ordenar eventos cuando cambian los criterios
  useEffect(() => {
    let filtered = [...events];
    
    // Filtrar por deporte seleccionado
    if (selectedSport !== 'all') {
      filtered = filtered.filter(event => {
        // Usar el campo 'sport' directamente
        return event.sport === selectedSport;
      });
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.home_team?.toLowerCase().includes(term) || 
        event.away_team?.toLowerCase().includes(term) ||
        event.competition?.toLowerCase().includes(term) ||
        event.sport?.toLowerCase().includes(term)
      );
    }
    
    // Ordenar por criterio seleccionado
    switch (sortBy) {
      case 'time':
        filtered.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
        break;
      case 'league':
        filtered.sort((a, b) => {
          const leagueA = a.competition || a.sport || '';
          const leagueB = b.competition || b.sport || '';
          return leagueA.localeCompare(leagueB);
        });
        break;
      case 'sport':
        filtered.sort((a, b) => {
          const sportA = a.sport || '';
          const sportB = b.sport || '';
          return sportA.localeCompare(sportB);
        });
        break;
      default:
        break;
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedSport, searchTerm, sortBy]);
  
  // Manejar cambios de deporte
  const handleSportChange = (event, newValue) => {
    setSelectedSport(newValue);
    if (newValue === 'all') {
      navigate('/sports');
    } else {
      // Usar el nombre del deporte para la URL (convertir espacios a guiones)
      const sportSlug = newValue.toLowerCase().replace(/\s+/g, '-');
      navigate(`/sports/${sportSlug}`);
    }
  };
  
  // Obtener deportes únicos de los eventos disponibles
  const getAvailableSports = () => {
    if (!events || events.length === 0) return [];
    
    // Extraer deportes únicos del campo 'sport'
    const uniqueSports = [...new Set(events.map(event => event.sport).filter(Boolean))];
    
    return uniqueSports.map(sportName => ({
      key: sportName,
      name: sportName,
      displayName: formatSportDisplayName(sportName)
    }));
  };
  
  // Formatear nombre del deporte para mostrar
  const formatSportDisplayName = (sportName) => {
    const displayNameMap = {
      'MLB': 'MLB (Baseball)',
      'NBA': 'NBA (Basketball)', 
      'NFL': 'NFL (Football)',
      'NHL': 'NHL (Hockey)',
      'Premier League': 'Premier League',
      'La Liga': 'La Liga',
      'Serie A': 'Serie A',
      'Bundesliga': 'Bundesliga',
      'Ligue 1': 'Ligue 1',
      'Champions League': 'Champions League',
      'Europa League': 'Europa League'
    };
    
    return displayNameMap[sportName] || sportName;
  };
  
  // Convertir slug de URL a nombre de deporte
  const getSlugToSportName = () => {
    const slugMap = {
      'mlb': 'MLB',
      'nba': 'NBA',
      'nfl': 'NFL', 
      'nhl': 'NHL',
      'premier-league': 'Premier League',
      'la-liga': 'La Liga',
      'serie-a': 'Serie A',
      'bundesliga': 'Bundesliga',
      'ligue-1': 'Ligue 1',
      'champions-league': 'Champions League',
      'europa-league': 'Europa League'
    };
    
    return slugMap[sportKey] || sportKey;
  };
  
  // Actualizar selectedSport basado en el slug de la URL
  useEffect(() => {
    if (sportKey) {
      const sportName = getSlugToSportName();
      setSelectedSport(sportName);
    } else {
      setSelectedSport('all');
    }
  }, [sportKey]);
  
  // Contar eventos por deporte
  const getEventCountBySport = (sportName) => {
    if (sportName === 'all') return events.length;
    
    return events.filter(event => event.sport === sportName).length;
  };
  
  if (loading) {
    return <Loading />;
  }
  
  const availableSports = getAvailableSports();
  
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* Contenido principal */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Eventos Deportivos
            </Typography>
            
            {/* Estadísticas rápidas */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${events.length} eventos total`} 
                color="primary" 
                variant="outlined" 
                size="small"
              />
              <Chip 
                label={`${availableSports.length} deportes activos`} 
                color="secondary" 
                variant="outlined" 
                size="small"
              />
              {selectedSport !== 'all' && (
                <Chip 
                  label={`${filteredEvents.length} eventos filtrados`} 
                  color="success" 
                  variant="outlined" 
                  size="small"
                />
              )}
            </Box>
            
            {/* Filtros y búsqueda */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                label="Buscar equipos o ligas"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
                placeholder="Ej: Yankees, Chelsea, Lakers..."
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="time">Hora de inicio</MenuItem>
                  <MenuItem value="league">Liga/Competición</MenuItem>
                  <MenuItem value="sport">Deporte</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Tabs de deportes */}
            <Tabs
              value={selectedSport}
              onChange={handleSportChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ mb: 3 }}
            >
              <Tab 
                value="all" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Todos</span>
                    <Chip 
                      label={getEventCountBySport('all')} 
                      size="small" 
                      color="primary"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
              />
              {availableSports
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((sport) => (
                  <Tab 
                    key={sport.key} 
                    value={sport.key} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{sport.displayName}</span>
                        <Chip 
                          label={getEventCountBySport(sport.key)} 
                          size="small" 
                          color="secondary"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                  />
                ))}
            </Tabs>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Información del filtro actual */}
            {selectedSport !== 'all' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Mostrando eventos de: <strong>{formatSportDisplayName(selectedSport)}</strong>
                {searchTerm && (
                  <span> | Búsqueda: <strong>"{searchTerm}"</strong></span>
                )}
              </Alert>
            )}
            
            {/* Lista de eventos */}
            {filteredEvents.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron eventos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {searchTerm ? 
                    `No hay eventos que coincidan con "${searchTerm}"` :
                    selectedSport !== 'all' ? 
                      `No hay eventos disponibles para ${formatSportDisplayName(selectedSport)}` :
                      'No hay eventos disponibles en este momento'
                  }
                </Typography>
                {(selectedSport !== 'all' || searchTerm) && (
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSelectedSport('all');
                      setSearchTerm('');
                      navigate('/sports');
                    }}
                  >
                    Ver todos los eventos
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id || event.api_event_id}>
                    <EventCard event={event} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
        
        {/* Panel de apuestas */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, position: 'sticky', top: '100px' }}>
            <Typography variant="h6" gutterBottom>
              Boleto de Apuestas
              {bettingSlip.length > 0 && (
                <Chip 
                  label={bettingSlip.length} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {bettingSlip.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tu boleto de apuestas está vacío
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Selecciona cuotas para añadirlas a tu boleto
                </Typography>
              </Box>
            ) : (
              <BettingSlip />
            )}
            
            {!isAuthenticated && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión para apostar
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Sports;