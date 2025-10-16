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
  SportsRugby
} from '@mui/icons-material';
import { getSports } from '../../api/sports';

const SportsSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [sports, setSports] = useState([]);
  
  // Mapeo de deportes a iconos
  const sportIcons = {
    'NBA': SportsBasketball,
    'NFL': SportsFootball,
    'MLB': SportsBaseball,
    'NHL': SportsHockey,
    'Premier League': SportsSoccer,
    'La Liga': SportsSoccer,
    'Serie A': SportsSoccer,
    'Bundesliga': SportsSoccer,
    'Ligue 1': SportsSoccer,
    'Champions League': SportsSoccer,
    'Wimbledon': SportsTennis,
    'Tennis': SportsTennis,
    'PGA': SportsGolf,
    'Golf': SportsGolf,
    'UFC': SportsEsports,
    'MMA': SportsEsports,
    'F1': SportsMotorsports,
    'Formula 1': SportsMotorsports,
    'NRL': SportsRugby,
    'Rugby': SportsRugby
  };

  // Deportes predefinidos (en caso de que la API no esté disponible)
  const defaultSports = [
    { name: 'NBA', displayName: 'NBA' },
    { name: 'NFL', displayName: 'NFL' },
    { name: 'MLB', displayName: 'MLB' },
    { name: 'Premier League', displayName: 'PL' },
    { name: 'NHL', displayName: 'NHL' },
    { name: 'Tennis', displayName: 'Tennis' },
    { name: 'Golf', displayName: 'PGA' },
    { name: 'UFC', displayName: 'UFC' },
    { name: 'F1', displayName: 'F1' },
    { name: 'Rugby', displayName: 'NRL' }
  ];

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sportsData = await getSports();
        if (sportsData && sportsData.length > 0) {
          setSports(sportsData);
        } else {
          setSports(defaultSports);
        }
      } catch (error) {
        console.warn('Error loading sports, using defaults:', error);
        setSports(defaultSports);
      }
    };

    fetchSports();
  }, []);

  const handleSportClick = (sportName) => {
    const sportSlug = sportName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/sports/${sportSlug}`);
  };

  const isSelected = (sportName) => {
    const sportSlug = sportName.toLowerCase().replace(/\s+/g, '-');
    return location.pathname === `/sports/${sportSlug}`;
  };

  const getIcon = (sportName) => {
    const IconComponent = sportIcons[sportName] || Sports;
    return <IconComponent />;
  };

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
        {sports.map((sport) => {
          const sportName = sport.name || sport;
          const displayName = sport.displayName || sport.name || sport;
          const selected = isSelected(sportName);
          
          return (
            <ListItem key={sportName} disablePadding>
              <ListItemButton
                onClick={() => handleSportClick(sportName)}
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: selected ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRight: selected ? `3px solid ${theme.palette.secondary.main}` : 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                  {getIcon(sportName)}
                </ListItemIcon>
                <ListItemText 
                  primary={displayName}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: selected ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default SportsSidebar;