import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  useTheme,
  Container,
  Alert
} from '@mui/material';
import { getSports, getEvents } from '../api/sports';
import EventsTable from '../components/sports/EventsTable';
import BettingSlipPanel from '../components/betting/BettingSlipPanel';
import BettingContext from '../contexts/BettingContext';
import AuthContext from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const Sports = () => {
  const { sportKey } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useContext(AuthContext);
  const { bettingSlip } = useContext(BettingContext);
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [sports, setSports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState(sportKey || 'all');
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Obtener término de búsqueda de la URL
  const searchTerm = searchParams.get('search') || '';
  
  // Cargar deportes y eventos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const eventsData = await getEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        
        try {
          const sportsData = await getSports();
          setSports(sportsData);
        } catch (sportsError) {
          console.warn('No se pudieron cargar deportes desde la API:', sportsError);
        }
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
    if (sportKey) {
      const sportName = getSlugToSportName();
      setSelectedSport(sportName);
    } else {
      setSelectedSport('all');
    }
  }, [sportKey]);
  
  // Filtrar eventos cuando cambian los criterios
  useEffect(() => {
    let filtered = [...events];
    
    // Filtrar por deporte seleccionado
    if (selectedSport !== 'all') {
      filtered = filtered.filter(event => event.sport === selectedSport);
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
    
    // Ordenar por hora de inicio
    filtered.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
    
    setFilteredEvents(filtered);
  }, [events, selectedSport, searchTerm]);
  
  // Manejar cambios de deporte
  const handleSportChange = (event, newValue) => {
    setSelectedSport(newValue);
    if (newValue === 'all') {
      navigate('/sports');
    } else {
      const sportSlug = newValue.toLowerCase().replace(/\s+/g, '-');
      navigate(`/sports/${sportSlug}`);
    }
  };
  
  // Obtener deportes únicos de los eventos disponibles
  const getAvailableSports = () => {
    if (!events || events.length === 0) return [];
    
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
      'MLB': 'MLB',
      'NBA': 'NBA', 
      'NFL': 'NFL',
      'NHL': 'NHL',
      'Premier League': 'PL',
      'La Liga': 'La Liga',
      'Serie A': 'Serie A',
      'Bundesliga': 'Bundesliga',
      'Ligue 1': 'Ligue 1',
      'Champions League': 'UCL',
      'Tennis': 'WIMBLEDON',
      'Golf': 'PGA',
      'Cricket': 'ICC'
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
      'wimbledon': 'Tennis',
      'tennis': 'Tennis',
      'pga': 'Golf',
      'golf': 'Golf',
      'icc': 'Cricket',
      'cricket': 'Cricket'
    };
    
    return slugMap[sportKey] || sportKey;
  };
  
  if (loading) {
    return <Loading />;
  }
  
  const availableSports = getAvailableSports();
  
  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Tabs de deportes */}
        <Paper 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Tabs
            value={selectedSport}
            onChange={handleSportChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minWidth: 80,
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab value="all" label="ALL" />
            {availableSports
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((sport) => (
                <Tab 
                  key={sport.key} 
                  value={sport.key} 
                  label={sport.displayName}
                />
              ))}
          </Tabs>
        </Paper>

        {/* Información de búsqueda */}
        {searchTerm && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Resultados de búsqueda para: <strong>"{searchTerm}"</strong>
          </Alert>
        )}

        {/* Sección destacada - Popular Same Game Parlay Bets */}
        {selectedSport === 'NFL' && (
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box 
                sx={{ 
                  backgroundColor: '#22c55e', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                $
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Popular Same Game Parlay Bets
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              backgroundColor: 'white',
              borderRadius: 1,
              border: '1px solid #e5e7eb'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  🔥 11844 PEOPLE PLACED
                </Box>
                <Typography variant="body2" color="text.secondary">
                  4 Selections
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Chip 
                label="+1149"
                sx={{ 
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              />
            </Box>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Tabla de eventos */}
        {filteredEvents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron eventos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 
                `No hay eventos que coincidan con "${searchTerm}"` :
                selectedSport !== 'all' ? 
                  `No hay eventos disponibles para ${formatSportDisplayName(selectedSport)}` :
                  'No hay eventos disponibles en este momento'
              }
            </Typography>
          </Paper>
        ) : (
          <EventsTable 
            events={filteredEvents} 
            selectedSport={selectedSport}
          />
        )}
      </Box>
      
      {/* Panel de apuestas fijo */}
      <BettingSlipPanel />
    </Box>
  );
};

export default Sports;