import React, { useContext, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  Collapse,
  Fab,
  Badge
} from '@mui/material';
import {
  Close,
  Delete,
  ExpandMore,
  ExpandLess,
  Receipt,
  ShoppingCart
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import BettingContext from '../../contexts/BettingContext';
import AuthContext from '../../contexts/AuthContext';
import { createTicket } from '../../api/bets';

const BettingSlipPanel = () => {
  const { bettingSlip, removeBetFromSlip, clearBettingSlip } = useContext(BettingContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [isExpanded, setIsExpanded] = useState(true); // ✅ Desplegado por defecto
  const [placingBet, setPlacingBet] = useState(false);
  const [showMobileBetSlip, setShowMobileBetSlip] = useState(false);

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
    enqueueSnackbar('Selección eliminada', { variant: 'info' });
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
      setShowMobileBetSlip(false);

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

  // Botón flotante para móvil
  if (isMobile) {
    return (
      <>
        {/* FAB para mostrar betting slip */}
        {bettingSlip.length > 0 && (
          <Fab
            color="primary"
            onClick={() => setShowMobileBetSlip(true)}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000
            }}
          >
            <Badge badgeContent={bettingSlip.length} color="error">
              <ShoppingCart />
            </Badge>
          </Fab>
        )}

        {/* Modal de betting slip para móvil */}
        {showMobileBetSlip && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'flex-end'
            }}
            onClick={() => setShowMobileBetSlip(false)}
          >
            <Paper
              sx={{
                width: '100%',
                maxHeight: '80vh',
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Betslip ({bettingSlip.length})
                </Typography>
                <IconButton onClick={() => setShowMobileBetSlip(false)}>
                  <Close />
                </IconButton>
              </Box>

              {/* Content móvil */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {/* Selecciones móvil */}
                {bettingSlip.map((bet, index) => (
                  <Card key={bet.id} sx={{ mb: 1.5, border: '1px solid #e5e7eb' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {bet.league}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem', lineHeight: 1.2 }}>
                            {bet.matchup}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveBet(bet.id)}
                          sx={{ p: 0.5 }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {bet.selection}
                          </Typography>
                          {bet.isParlayBet && bet.selections && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {bet.selections.length} leg parlay
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={formatOdds(bet.price)}
                          size="small"
                          sx={{
                            backgroundColor: bet.isParlayBet ? '#f59e0b' : theme.palette.success.main,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Bottom section móvil - apuesta */}
              <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                {/* Cuota total */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Total Odds:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {totalOdds.toFixed(2)}
                  </Typography>
                </Box>

                {/* Input de monto */}
                <TextField
                  fullWidth
                  label="Wager Amount"
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
                  placeholder="$0.00"
                />

                {/* Cálculos */}
                {stakeAmount && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Wager:</Typography>
                      <Typography variant="body2">
                        ${formatCurrency(stakeAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">To Win:</Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        +${formatCurrency(potentialProfit)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Total Payout:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ${formatCurrency(potentialPayout)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Balance */}
                {isAuthenticated && (
                  <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                    <Typography variant="caption">
                      Available: ${formatCurrency(user?.balance)}
                    </Typography>
                  </Alert>
                )}

                {/* Botón de apuesta */}
                {isAuthenticated ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePlaceBet}
                    disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || placingBet}
                    sx={{
                      backgroundColor: theme.palette.success.main,
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: theme.palette.success.dark
                      }
                    }}
                  >
                    {placingBet ? 'Placing Bet...' : `BET $${formatCurrency(stakeAmount)}`}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: theme.palette.success.main,
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: theme.palette.success.dark
                      }
                    }}
                  >
                    LOG IN OR JOIN TO WIN $0.00
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </>
    );
  }

  // VERSIÓN DESKTOP - Panel fijo siempre visible
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 120,
        right: 20,
        width: 350,
        maxHeight: 'calc(100vh - 140px)',
        zIndex: 1000,
        display: { xs: 'none', md: 'block' }
      }}
    >
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header siempre visible */}
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              {bettingSlip.length}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Betslip
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {bettingSlip.length > 0 && (
              <>
                <IconButton
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ color: 'white' }}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  sx={{ color: 'white' }}
                >
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Contenido principal - siempre expandido si hay apuestas */}
        {bettingSlip.length === 0 ? (
          // Estado vacío
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No selections yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click on odds to add to your betslip
            </Typography>
          </Box>
        ) : (
          // Contenido con apuestas - siempre mostrado
          <Collapse in={isExpanded} unmountOnExit>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {/* Selecciones */}
              <Box sx={{ p: 2 }}>
                {bettingSlip.map((bet, index) => (
                  <Card key={bet.id} sx={{ mb: 1.5, border: '1px solid #e5e7eb' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {bet.league}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem', lineHeight: 1.2 }}>
                            {bet.matchup}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveBet(bet.id)}
                          sx={{ p: 0.5 }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {bet.selection}
                          </Typography>
                          {bet.isParlayBet && bet.selections && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {bet.selections.length} leg parlay
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={formatOdds(bet.price)}
                          size="small"
                          sx={{
                            backgroundColor: bet.isParlayBet ? '#f59e0b' : theme.palette.success.main,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Cálculos y apuesta */}
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              {/* Cuota total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Total Odds:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {totalOdds.toFixed(2)}
                </Typography>
              </Box>

              {/* Input de monto */}
              <TextField
                fullWidth
                label="Wager Amount"
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
                placeholder="$0.00"
              />

              {/* Cálculos de ganancia */}
              {stakeAmount && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Wager:</Typography>
                    <Typography variant="body2">
                      ${formatCurrency(stakeAmount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">To Win:</Typography>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      +${formatCurrency(potentialProfit)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Total Payout:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${formatCurrency(potentialPayout)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Balance del usuario */}
              {isAuthenticated && (
                <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                  <Typography variant="caption">
                    Available: ${formatCurrency(user?.balance)}
                  </Typography>
                </Alert>
              )}

              {/* Botón de apuesta */}
              {isAuthenticated ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePlaceBet}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || placingBet}
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark
                    }
                  }}
                >
                  {placingBet ? 'Placing Bet...' : `BET $${formatCurrency(stakeAmount)}`}
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark
                    }
                  }}
                >
                  LOG IN OR JOIN TO WIN $0.00
                </Button>
              )}
            </Box>
          </Collapse>
        )}
      </Paper>
    </Box>
  );
};

export default BettingSlipPanel;