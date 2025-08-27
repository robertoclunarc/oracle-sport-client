import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Schedule, 
  Sports,
  TrendingUp 
} from '@mui/icons-material';
import BettingContext from '../../contexts/BettingContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventCard = ({ event }) => {
  const { addToBettingSlip } = useContext(BettingContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const eventTime = new Date(event.commence_time);
  const formattedTime = format(eventTime, 'dd MMM, HH:mm', { locale: es });

  // Organizar las cuotas por tipo
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

  const organizedOdds = organizeOdds(event.odds);

  const handleBetClick = (oddsData, betType, selection, description) => {
  const betItem = {
    id: `${event.id || event.api_event_id}-${betType}-${selection}`,
    eventId: event.id,
    api_event_id: event.api_event_id || event.id, // Incluir API ID
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

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header con info del evento */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Chip 
              icon={<Sports />}
              label={event.sport || event.competition} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption">
                {formattedTime}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Equipos */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {event.away_team}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            vs
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {event.home_team}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Cuotas Principales (Money Line) */}
        {organizedOdds.h2h && Object.keys(organizedOdds.h2h).length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Ganador
            </Typography>
            <Grid container spacing={1}>
              {organizedOdds.h2h.away && (
                <Grid size={{ xs: organizedOdds.h2h.draw ? 4 : 6 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => handleBetClick(
                      organizedOdds.h2h.away,
                      'h2h',
                      'away',
                      `${event.away_team} gana`
                    )}
                    sx={{ 
                      py: 1,
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" display="block">
                        {isMobile ? event.away_team.substring(0, 8) + '...' : event.away_team}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatOdds(organizedOdds.h2h.away.price)}
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              )}
              
              {organizedOdds.h2h.draw && (
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => handleBetClick(
                      organizedOdds.h2h.draw,
                      'h2h',
                      'draw',
                      'Empate'
                    )}
                    sx={{ 
                      py: 1,
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" display="block">
                        Empate
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatOdds(organizedOdds.h2h.draw.price)}
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              )}

              {organizedOdds.h2h.home && (
                <Grid size={{ xs: organizedOdds.h2h.draw ? 4 : 6 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => handleBetClick(
                      organizedOdds.h2h.home,
                      'h2h',
                      'home',
                      `${event.home_team} gana`
                    )}
                    sx={{ 
                      py: 1,
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" display="block">
                        {isMobile ? event.home_team.substring(0, 8) + '...' : event.home_team}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatOdds(organizedOdds.h2h.home.price)}
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Más mercados disponibles */}
        {(Object.keys(organizedOdds.spread).length > 0 || Object.keys(organizedOdds.totals).length > 0) && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={RouterLink}
              to={`/event/${event.id}`}
              variant="text"
              size="small"
              startIcon={<TrendingUp />}
              sx={{ 
                fontSize: '0.75rem',
                textTransform: 'none'
              }}
            >
              Ver más mercados
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;