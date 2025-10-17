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
  Alert
} from '@mui/material';
import { getSports, getEvents } from '../api/sports';
import EventsTable from '../components/sports/EventsTable';
import BettingSlipPanel from '../components/betting/BettingSlipPanel';
import PopularParlayBets from '../components/sports/PopularParlayBets';
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
  
  // Formatear nombre del deporte para mostrar en tabs
  const formatSportDisplayName = (sportName) => {
    const displayNameMap = {
      'MLB': 'MLB',
      'NBA': 'NBA', 
      'NFL': 'NFL',
      'NHL': 'NHL',
      'Premier League': 'EPL',
      'La Liga': 'La Liga',
      'Serie A': 'Serie A',
      'Bundesliga': 'Bundesliga',
      'Ligue 1': 'Ligue 1',
      'Champions League': 'UCL',
      'Tennis': 'Tennis',
      'Wimbledon': 'Wimbledon',
      'Golf': 'Golf',
      'PGA': 'PGA',
      'Cricket': 'Cricket',
      'ICC': 'ICC',
      'UFC': 'UFC',
      'MMA': 'MMA',
      'Boxing': 'Boxing',
      'F1': 'F1',
      'Formula 1': 'F1',
      'Rugby': 'Rugby',
      'NRL': 'NRL'
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
      'epl': 'Premier League',
      'la-liga': 'La Liga',
      'serie-a': 'Serie A',
      'bundesliga': 'Bundesliga',
      'ligue-1': 'Ligue 1',
      'champions-league': 'Champions League',
      'ucl': 'Champions League',
      'wimbledon': 'Tennis',
      'tennis': 'Tennis',
      'pga': 'Golf',
      'golf': 'Golf',
      'icc': 'Cricket',
      'cricket': 'Cricket',
      'ufc': 'UFC',
      'mma': 'MMA',
      'boxing': 'Boxing',
      'f1': 'F1',
      'formula-1': 'Formula 1',
      'rugby': 'Rugby',
      'nrl': 'NRL'
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

        {/* Popular Same Game Parlay Bets - dinámico basado en eventos reales */}
        <PopularParlayBets 
          events={events}
          selectedSport={selectedSport}
        />

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