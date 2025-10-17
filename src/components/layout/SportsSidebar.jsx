import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Sports,
  SportsBasketball,
  SportsFootball,
  SportsBaseball,
  SportsHockey,
  SportsSoccer,
  SportsTennis,
  SportsGolf,
  SportsEsports,
  SportsMotorsports,
  SportsRugby,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { getSports, getEvents } from '../../api/sports';

const SportsSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [availableSports, setAvailableSports] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(['Soccer']); // Soccer expandido por defecto
  
  // Mapeo de deportes individuales a categorías principales
  const sportCategories = {
    'American Football': {
      icon: SportsFootball,
      sports: ['NFL']
    },
    'Basketball': {
      icon: SportsBasketball,
      sports: ['NBA']
    },
    'Baseball': {
      icon: SportsBaseball,
      sports: ['MLB']
    },
    'Ice Hockey': {
      icon: SportsHockey,
      sports: ['NHL']
    },
    'Soccer': {
      icon: SportsSoccer,
      sports: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League']
    },
    'Tennis': {
      icon: SportsTennis,
      sports: ['Tennis', 'Wimbledon']
    },
    'Golf': {
      icon: SportsGolf,
      sports: ['Golf', 'PGA']
    },
    'Combat Sports': {
      icon: SportsEsports,
      sports: ['UFC', 'MMA', 'Boxing']
    },
    'Motorsports': {
      icon: SportsMotorsports,
      sports: ['F1', 'Formula 1']
    },
    'Rugby': {
      icon: SportsRugby,
      sports: ['NRL', 'Rugby']
    }
  };

  // Obtener nombres cortos para el sidebar
  const getShortName = (sportName) => {
    const shortNames = {
      'Premier League': 'EPL',
      'La Liga': 'La Liga',
      'Serie A': 'Serie A',
      'Bundesliga': 'Bundesliga',
      'Ligue 1': 'Ligue 1',
      'Champions League': 'UCL',
      'NBA': 'NBA',
      'NFL': 'NFL',
      'MLB': 'MLB',
      'NHL': 'NHL',
      'Tennis': 'Tennis',
      'Golf': 'PGA',
      'UFC': 'UFC',
      'F1': 'F1'
    };
    
    return shortNames[sportName] || sportName;
  };

  useEffect(() => {
    const fetchAvailableSports = async () => {
      try {
        // Obtener eventos para saber qué deportes tienen datos
        const events = await getEvents();
        const uniqueSports = [...new Set(events.map(event => event.sport).filter(Boolean))];
        setAvailableSports(uniqueSports);
      } catch (error) {
        console.warn('Error loading sports, using defaults:', error);
        // Deportes por defecto si no hay conexión al API
        setAvailableSports(['NBA', 'NFL', 'MLB', 'NHL', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Tennis', 'Golf', 'UFC', 'F1']);
      }
    };

    fetchAvailableSports();
  }, []);

  const handleCategoryToggle = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSportClick = (sportName) => {
    const sportSlug = sportName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/sports/${sportSlug}`);
  };

  const isSelected = (sportName) => {
    const sportSlug = sportName.toLowerCase().replace(/\s+/g, '-');
    return location.pathname === `/sports/${sportSlug}`;
  };

  // Organizar deportes disponibles por categorías
  const organizedSports = {};
  
  Object.entries(sportCategories).forEach(([category, categoryData]) => {
    const sportsInCategory = categoryData.sports.filter(sport => 
      availableSports.includes(sport)
    );
    
    if (sportsInCategory.length > 0) {
      organizedSports[category] = {
        ...categoryData,
        sports: sportsInCategory
      };
    }
  });

  return (
    <Box
      sx={{
        width: 200,
        height: '100vh',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        position: 'fixed',
        left: 0,
        top: 64, // Height of AppBar
        zIndex: theme.zIndex.drawer,
        overflowY: 'auto'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Sports />
          Sports
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <List sx={{ p: 0 }}>
        {Object.entries(organizedSports).map(([category, categoryData]) => {
          const isExpanded = expandedCategories.includes(category);
          const Icon = categoryData.icon;
          
          return (
            <Box key={category}>
              {/* Categoría Principal */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleCategoryToggle(category)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={category}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              {/* Deportes/Ligas de la categoría */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {categoryData.sports.map((sport) => {
                    const selected = isSelected(sport);
                    
                    return (
                      <ListItem key={sport} disablePadding>
                        <ListItemButton
                          onClick={() => handleSportClick(sport)}
                          sx={{
                            py: 1,
                            px: 4, // Indentación para subitems
                            backgroundColor: selected ? 'rgba(255,255,255,0.15)' : 'transparent',
                            borderRight: selected ? `3px solid ${theme.palette.secondary.main}` : 'none',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.08)'
                            }
                          }}
                        >
                          <ListItemText 
                            primary={getShortName(sport)}
                            primaryTypographyProps={{
                              fontSize: '0.8rem',
                              fontWeight: selected ? 600 : 400,
                              color: selected ? 'white' : 'rgba(255,255,255,0.9)'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );
};

export default SportsSidebar;