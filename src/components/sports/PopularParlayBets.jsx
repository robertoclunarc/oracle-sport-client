import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  TrendingUp
} from '@mui/icons-material';
import BettingContext from '../../contexts/BettingContext';

const PopularParlayBets = ({ events, selectedSport }) => {
  const { addToBettingSlip } = useContext(BettingContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dynamicParlay, setDynamicParlay] = useState(null);

  useEffect(() => {
    if (events && events.length > 0) {
      generateDynamicParlay();
    }
  }, [events]);

  const generateDynamicParlay = () => {
    // Obtener eventos de diferentes deportes para crear un parlay diverso
    const sportGroups = {};
    
    events.forEach(event => {
      if (!sportGroups[event.sport]) {
        sportGroups[event.sport] = [];
      }
      sportGroups[event.sport].push(event);
    });

    // Seleccionar un evento de cada deporte (máximo 4)
    const selectedEvents = [];
    const availableSports = Object.keys(sportGroups).slice(0, 4);
    
    availableSports.forEach(sport => {
      const eventsForSport = sportGroups[sport];
      if (eventsForSport.length > 0) {
        // Tomar el primer evento que tenga cuotas
        const eventWithOdds = eventsForSport.find(e => e.odds && e.odds.length > 0);
        if (eventWithOdds) {
          selectedEvents.push(eventWithOdds);
        }
      }
    });

    if (selectedEvents.length < 2) return;

    // Crear selecciones basadas en eventos reales
    const selections = selectedEvents.map((event, index) => {
      // Buscar diferentes tipos de cuotas para variedad
      let selection = null;
      
      if (event.odds) {
        // Priorizar diferentes tipos de mercados
        const h2hOdds = event.odds.find(odd => odd.market_type === 'h2h' && odd.outcome_name === 'home');
        const spreadOdds = event.odds.find(odd => odd.market_type === 'spread');
        const totalsOdds = event.odds.find(odd => odd.market_type === 'totals' && odd.outcome_name === 'over');
        
        if (index === 0 && h2hOdds) {
          selection = {
            id: `selection_${index + 1}`,
            team: event.home_team,
            market: 'To Win',
            type: 'MONEYLINE',
            odds: h2hOdds.price >= 0 ? `+${h2hOdds.price}` : h2hOdds.price.toString(),
            event: event
          };
        } else if (index === 1 && spreadOdds) {
          selection = {
            id: `selection_${index + 1}`,
            team: spreadOdds.outcome_name === 'home' ? event.home_team : event.away_team,
            market: `${spreadOdds.handicap}`,
            type: 'SPREAD',
            odds: spreadOdds.price >= 0 ? `+${spreadOdds.price}` : spreadOdds.price.toString(),
            event: event
          };
        } else if (totalsOdds) {
          selection = {
            id: `selection_${index + 1}`,
            team: `${event.away_team} vs ${event.home_team}`,
            market: `Over ${totalsOdds.total}`,
            type: 'TOTAL POINTS',
            odds: totalsOdds.price >= 0 ? `+${totalsOdds.price}` : totalsOdds.price.toString(),
            event: event
          };
        } else if (h2hOdds) {
          // Fallback a moneyline
          selection = {
            id: `selection_${index + 1}`,
            team: event.home_team,
            market: 'To Win',
            type: 'MONEYLINE',
            odds: h2hOdds.price >= 0 ? `+${h2hOdds.price}` : h2hOdds.price.toString(),
            event: event
          };
        }
      }
      
      return selection;
    }).filter(Boolean);

    if (selections.length < 2) return;

    // Calcular cuotas totales del parlay
    const totalDecimalOdds = selections.reduce((total, selection) => {
      const odds = parseFloat(selection.odds);
      const decimal = odds >= 0 ? (odds / 100) + 1 : 100 / Math.abs(odds) + 1;
      return total * decimal;
    }, 1);

    const americanOdds = totalDecimalOdds >= 2 ? 
      `+${Math.round((totalDecimalOdds - 1) * 100)}` : 
      `-${Math.round(100 / (totalDecimalOdds - 1))}`;

    const wagerAmount = 10;
    const potentialWin = (totalDecimalOdds - 1) * wagerAmount;
    
    // Generar un número aleatorio de personas que apostaron (entre 8000-15000)
    const peopleCount = Math.floor(Math.random() * 7000) + 8000;

    setDynamicParlay({
      id: `parlay_${Date.now()}`,
      matchup: `${selections.length}-Leg Multi-Sport Parlay`,
      totalOdds: americanOdds,
      wagerAmount: wagerAmount,
      potentialWin: potentialWin,
      peopleCount: peopleCount,
      selections: selections
    });
  };

  const handleAddToSlip = () => {
    if (!dynamicParlay) return;

    const parlayBet = {
      id: dynamicParlay.id,
      eventId: 'multi_sport_parlay',
      api_event_id: 'multi_sport_parlay',
      oddsId: 'parlay_odds_dynamic',
      matchup: dynamicParlay.matchup,
      league: 'Multi-Sport',
      selection: `Popular Parlay (${dynamicParlay.selections.length} legs)`,
      price: dynamicParlay.totalOdds.replace('+', ''),
      marketType: 'parlay',
      eventTime: new Date().toISOString(),
      isParlayBet: true,
      selections: dynamicParlay.selections
    };

    addToBettingSlip(parlayBet);
  };

  // Solo mostrar si hay eventos disponibles y se generó un parlay
  if (!dynamicParlay || !events || events.length === 0) {
    return null;
  }

  return (
    <Paper 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          cursor: 'pointer',
          backgroundColor: '#f8f9fa',
          '&:hover': {
            backgroundColor: '#f1f3f4'
          }
        }}
      >
        <Box 
          sx={{ 
            backgroundColor: '#22c55e', 
            color: 'white', 
            px: 1, 
            py: 0.5, 
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            minWidth: 24,
            textAlign: 'center'
          }}
        >
          $
        </Box>
        
        <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Popular Same Game Parlay Bets
        </Typography>
        
        <IconButton size="small">
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          {/* Parlay Info */}
          <Card sx={{ mb: 2, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {dynamicParlay.matchup}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`🔥 ${dynamicParlay.peopleCount.toLocaleString()} PEOPLE PLACED`}
                      size="small"
                      sx={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {dynamicParlay.selections.length} Selections
                    </Typography>
                  </Box>
                </Box>
                
                <Chip
                  label={dynamicParlay.totalOdds}
                  sx={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    px: 1
                  }}
                />
              </Box>

              {/* Selections */}
              <Box sx={{ mb: 2 }}>
                {dynamicParlay.selections.map((selection, index) => (
                  <Box key={selection.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selection.team} {selection.market}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selection.team.toUpperCase()} · {selection.type}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {selection.odds}
                      </Typography>
                    </Box>
                    {index < dynamicParlay.selections.length - 1 && (
                      <Divider sx={{ my: 0.5 }} />
                    )}
                  </Box>
                ))}
              </Box>

              {/* Add to Betslip Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddToSlip}
                sx={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: '#16a34a'
                  }
                }}
              >
                ADD TO BETSLIP
                <br />
                ${dynamicParlay.wagerAmount} WAGER WINS ${dynamicParlay.potentialWin.toFixed(2)}
              </Button>
            </CardContent>
          </Card>

          {/* Enter Parlay Hub Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              endIcon={<TrendingUp />}
              sx={{
                color: '#3b82f6',
                textTransform: 'none',
                fontSize: '0.875rem'
              }}
            >
              Enter Parlay Hub to View More
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PopularParlayBets;