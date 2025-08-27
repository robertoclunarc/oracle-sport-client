import React, { useContext, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  TextField,
  //Divider,
  List,
  //ListItem,
  //ListItemText,
  //ListItemSecondaryAction,
  Chip,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close,
  Delete,
  Receipt,
  ExpandMore,
  ExpandLess,
  Sports,
  Calculate,
  MonetizationOn
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import BettingContext from '../../contexts/BettingContext';
import AuthContext from '../../contexts/AuthContext';
import { createTicket } from '../../api/bets';

const BettingSlipModal = ({ open, onClose }) => {
  const { bettingSlip, removeBetFromSlip, clearBettingSlip } = useContext(BettingContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [placingBet, setPlacingBet] = useState(false);

  // Calcular cuota total
  const totalOdds = bettingSlip.reduce((total, bet) => {
    const odds = parseFloat(bet.price);
    return total * (odds >= 0 ? (odds / 100) + 1 : 100 / Math.abs(odds) + 1);
  }, 1);

  // Calcular ganancia potencial
  const potentialPayout = parseFloat(stakeAmount || 0) * totalOdds;
  const potentialProfit = potentialPayout - parseFloat(stakeAmount || 0);

  const handleRemoveBet = (betId) => {
    removeBetFromSlip(betId);
    enqueueSnackbar('Selección eliminada del boleto', { variant: 'info' });
  };

  const handleClearAll = () => {
    clearBettingSlip();
    enqueueSnackbar('Boleto limpiado', { variant: 'info' });
  };

  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar('Debes iniciar sesión para apostar', { variant: 'warning' });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      enqueueSnackbar('Ingresa un monto válido', { variant: 'error' });
      return;
    }

    if (parseFloat(stakeAmount) > user.balance) {
      enqueueSnackbar('Saldo insuficiente', { variant: 'error' });
      return;
    }

    if (bettingSlip.length === 0) {
      enqueueSnackbar('Agrega al menos una selección', { variant: 'error' });
      return;
    }

    try {
      setPlacingBet(true);

      const betData = {
        stake_amount: parseFloat(stakeAmount),
        selections: bettingSlip.map(bet => ({
          event_id: bet.eventId,
          api_event_id: bet.api_event_id,
          odds_id: bet.oddsId,
          selection: bet.selection,
          odds_value: bet.price
        }))
      };

      await createTicket(betData);

      enqueueSnackbar('¡Apuesta realizada exitosamente!', { variant: 'success' });
      clearBettingSlip();
      setStakeAmount('');
      onClose();

    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al realizar la apuesta',
        { variant: 'error' }
      );
    } finally {
      setPlacingBet(false);
    }
  };

  const formatOdds = (price) => {
    const odds = parseFloat(price);
    return odds >= 0 ? `+${odds}` : odds.toString();
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  if (bettingSlip.length === 0) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Boleto de Apuestas</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Sports sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Tu boleto está vacío
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona cuotas de los eventos para comenzar a apostar
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} fullWidth>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          height: isMobile ? '100vh' : 'auto'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Receipt sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Boleto de Apuestas</Typography>
          <Chip 
            label={`${bettingSlip.length} selección${bettingSlip.length !== 1 ? 'es' : ''}`}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          <IconButton 
            onClick={() => setIsExpanded(!isExpanded)} 
            size="small"
            sx={{ mr: 1 }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2 }}>
        <Collapse in={isExpanded}>
          {/* Selecciones */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Tus Selecciones
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleClearAll}
              >
                Limpiar Todo
              </Button>
            </Box>

            <List dense>
              {bettingSlip.map((bet, index) => (
                <React.Fragment key={bet.id}>
                  <Card sx={{ mb: 1 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {bet.matchup}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {bet.league} • {new Date(bet.eventTime).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {bet.selection}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={formatOdds(bet.price)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveBet(bet.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Collapse>

        {/* Cálculos */}
        <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Calculate sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Resumen de Apuesta
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Cuota Total:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {totalOdds.toFixed(2)}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Monto a Apostar (USDT)"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                inputProps={{ 
                  min: 1, 
                  max: user?.balance || 0,
                  step: 0.01
                }}
                sx={{ mb: 2 }}
                size="small"
              />

              {stakeAmount && (
                <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Ganancia Potencial:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                      +{formatCurrency(potentialProfit)} USDT
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total a Recibir:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                      {formatCurrency(potentialPayout)} USDT
                    </Typography>
                  </Box>
                </Box>
              )}

              {isAuthenticated && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Saldo disponible: {formatCurrency(user?.balance)} USDT
                  </Typography>
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Cerrar
          </Button>
          
          {isAuthenticated ? (
            <Button
              onClick={handlePlaceBet}
              variant="contained"
              disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || placingBet}
              startIcon={placingBet ? null : <MonetizationOn />}
              sx={{ flex: 2 }}
            >
              {placingBet ? 'Procesando...' : `Apostar ${formatCurrency(stakeAmount)} USDT`}
            </Button>
          ) : (
            <Button
              variant="contained"
              component="a"
              href="/login"
              sx={{ flex: 2 }}
            >
              Iniciar Sesión para Apostar
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BettingSlipModal;