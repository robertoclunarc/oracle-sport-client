import React, { useContext } from 'react';
import {
  TableCell,
  TableRow,
  Typography,
  Box,
  Button,
  Chip,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BettingContext from '../../contexts/BettingContext';

const EventRow = ({ event, selectedSport }) => {
  const { addToBettingSlip } = useContext(BettingContext);
  const theme = useTheme();

  const eventTime = new Date(event.commence_time);
  const formattedTime = format(eventTime, 'h:mm aa', { locale: es });

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
      api_event_id: event.api_event_id || event.id,
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

  const OddsButton = ({ odds, label, onClick, variant = 'outlined' }) => (
    <Button
      variant={variant}
      size="small"
      onClick={onClick}
      sx={{
        minWidth: 60,
        py: 0.5,
        px: 1,
        fontSize: '0.75rem',
        fontWeight: 'bold',
        border: '1px solid #e5e7eb',
        backgroundColor: 'white',
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        {label && (
          <Typography variant="caption" display="block" sx={{ lineHeight: 1 }}>
            {label}
          </Typography>
        )}
        <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
          {formatOdds(odds.price)}
        </Typography>
      </Box>
    </Button>
  );

  return (
    <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
      {/* Columna del evento */}
      <TableCell sx={{ py: 2 }}>
        <Box>
          {/* Equipos */}
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {event.away_team}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {event.home_team}
          </Typography>
          
          {/* Hora */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip 
              label={formattedTime}
              size="small"
              sx={{ 
                fontSize: '0.7rem',
                height: 20,
                backgroundColor: '#f3f4f6',
                color: 'text.secondary'
              }}
            />
          </Box>
        </Box>
      </TableCell>

      {/* Columna Spread */}
      <TableCell align="center" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {organizedOdds.spread.away && (
            <OddsButton
              odds={organizedOdds.spread.away}
              label={organizedOdds.spread.away.handicap}
              onClick={() => handleBetClick(
                organizedOdds.spread.away,
                'spread',
                'away',
                `${event.away_team} ${organizedOdds.spread.away.handicap}`
              )}
            />
          )}
          {organizedOdds.spread.home && (
            <OddsButton
              odds={organizedOdds.spread.home}
              label={organizedOdds.spread.home.handicap}
              onClick={() => handleBetClick(
                organizedOdds.spread.home,
                'spread',
                'home',
                `${event.home_team} ${organizedOdds.spread.home.handicap}`
              )}
            />
          )}
        </Box>
      </TableCell>

      {/* Columna Money Line */}
      <TableCell align="center" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {organizedOdds.h2h.away && (
            <OddsButton
              odds={organizedOdds.h2h.away}
              onClick={() => handleBetClick(
                organizedOdds.h2h.away,
                'h2h',
                'away',
                `${event.away_team} gana`
              )}
            />
          )}
          {organizedOdds.h2h.home && (
            <OddsButton
              odds={organizedOdds.h2h.home}
              onClick={() => handleBetClick(
                organizedOdds.h2h.home,
                'h2h',
                'home',
                `${event.home_team} gana`
              )}
            />
          )}
          {organizedOdds.h2h.draw && (
            <OddsButton
              odds={organizedOdds.h2h.draw}
              onClick={() => handleBetClick(
                organizedOdds.h2h.draw,
                'h2h',
                'draw',
                'Empate'
              )}
            />
          )}
        </Box>
      </TableCell>

      {/* Columna Total */}
      <TableCell align="center" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {organizedOdds.totals.over && (
            <OddsButton
              odds={organizedOdds.totals.over}
              label={`O ${organizedOdds.totals.over.total}`}
              onClick={() => handleBetClick(
                organizedOdds.totals.over,
                'totals',
                'over',
                `Over ${organizedOdds.totals.over.total}`
              )}
            />
          )}
          {organizedOdds.totals.under && (
            <OddsButton
              odds={organizedOdds.totals.under}
              label={`U ${organizedOdds.totals.under.total}`}
              onClick={() => handleBetClick(
                organizedOdds.totals.under,
                'totals',
                'under',
                `Under ${organizedOdds.totals.under.total}`
              )}
            />
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default EventRow;