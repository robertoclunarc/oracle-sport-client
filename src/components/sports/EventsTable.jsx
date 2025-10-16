import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EventRow from './EventRow';

const EventsTable = ({ events, selectedSport }) => {
  const theme = useTheme();

  const getTableHeaders = () => {
    if (selectedSport === 'NBA' || selectedSport === 'MLB' || selectedSport === 'NHL') {
      return ['NBA', 'SPREAD', 'MONEY', 'TOTAL'];
    }
    if (selectedSport === 'Premier League' || selectedSport === 'La Liga') {
      return ['MATCH', '1X2', 'OVER/UNDER', 'BOTH TEAMS'];
    }
    return ['EVENT', 'SPREAD', 'MONEY', 'TOTAL'];
  };

  const headers = getTableHeaders();

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Header de la sección */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedSport === 'NBA' && (
            <Box sx={{ 
              backgroundColor: 'white',
              borderRadius: '50%',
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🏀
            </Box>
          )}
          {selectedSport === 'MLB' && (
            <Box sx={{ 
              backgroundColor: 'white',
              borderRadius: '50%',
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ⚾
            </Box>
          )}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {selectedSport === 'all' ? 'All Sports' : `${selectedSport} Odds`}
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="text"
          sx={{ 
            color: 'white',
            textDecoration: 'underline',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          More {selectedSport === 'all' ? 'Events' : selectedSport}
        </Button>
      </Box>

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              {headers.map((header, index) => (
                <TableCell 
                  key={header}
                  align={index === 0 ? 'left' : 'center'}
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    py: 1.5
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <EventRow 
                key={event.id || event.api_event_id} 
                event={event}
                selectedSport={selectedSport}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EventsTable;