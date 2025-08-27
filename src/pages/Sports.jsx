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
  //Chip,
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
        
        // Cargar deportes
        const sportsData = await getSports();
        setSports(sportsData);
        
        // Cargar eventos
        
        const eventsData = await getEvents(sportKey);
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sportKey]);
  
  // Filtrar y ordenar eventos cuando cambian los criterios
  useEffect(() => {
    // Filtrar por deporte seleccionado
    let filtered = events;
    if (selectedSport !== 'all') {
      filtered = events.filter(event => event.sport_key === selectedSport);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.home_team.toLowerCase().includes(term) || 
        event.away_team.toLowerCase().includes(term)
      );
    }
    
    // Ordenar por criterio seleccionado
    switch (sortBy) {
      case 'time':
        filtered.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
        break;
      case 'league':
        filtered.sort((a, b) => a.competition.localeCompare(b.competition));
        break;
      default:
        break;
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedSport, searchTerm, sortBy]);
  
  // Manejar cambios de deporte
  const handleSportChange = (event, newValue) => {
    setSelectedSport(newValue);
    navigate(`/sports/${newValue === 'all' ? '' : newValue}`);
  };
  
  if (loading) {
    return <Loading />;
  }
  
  // Filtrar deportes principales
  const mainSports = Array.isArray(sports)
  ? sports.filter(sport =>
      ['Soccer', 'Basketball', 'Baseball', 'Ice Hockey'].includes(sport.group_name)
    )
  : [];
  
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* Contenido principal */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Eventos Deportivos
            </Typography>
            
            {/* Filtros y búsqueda */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                label="Buscar equipos"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="time">Hora de inicio</MenuItem>
                  <MenuItem value="league">Liga</MenuItem>
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
              <Tab value="all" label="Todos" />
              {mainSports.map((sport) => (
                <Tab 
                  key={sport.key} 
                  value={sport.key} 
                  label={sport.title}
                />
              ))}
            </Tabs>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {filteredEvents.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No se encontraron eventos para los criterios seleccionados.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
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
              Boleto de Apuestas ({bettingSlip.length})
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