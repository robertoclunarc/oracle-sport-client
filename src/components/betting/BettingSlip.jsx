import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import { Delete, Receipt } from '@mui/icons-material';
import BettingContext from '../../contexts/BettingContext';
import AuthContext from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const BettingSlip = () => {
  const {
    bettingSlip,
    betAmount,
    setBetAmount,
    totalOdds,
    potentialWin,
    removeFromBettingSlip,
    clearBettingSlip,
    submitBet,
    loading
  } = useContext(BettingContext);

  const { user, isAuthenticated } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();

  const handleBetAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    if (amount >= 0) {
      setBetAmount(amount);
    }
  };

  const handleSubmitBet = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar('Debes iniciar sesión para realizar una apuesta', { variant: 'warning' });
      return;
    }

    if (betAmount > user?.balance) {
      enqueueSnackbar('Saldo insuficiente para realizar esta apuesta', { variant: 'error' });
      return;
    }

    if (betAmount <= 0) {
      enqueueSnackbar('El monto de la apuesta debe ser mayor a 0', { variant: 'error' });
      return;
    }

    try {
      await submitBet();
      enqueueSnackbar('¡Apuesta realizada exitosamente!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Error al realizar la apuesta', { variant: 'error' });
    }
  };

  const formatOdds = (price) => {
    const odds = parseFloat(price);
    return odds >= 0 ? `+${odds}` : odds.toString();
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  if (bettingSlip.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Tu boleto está vacío
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona cuotas para añadirlas
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Lista de selecciones */}
      <Box sx={{ mb: 2 }}>
        {bettingSlip.map((bet, index) => (
          <Card key={bet.id} sx={{ mb: 1, backgroundColor: 'grey.50' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {bet.league}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {bet.matchup}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {bet.selection}
                  </Typography>
                  <Chip 
                    label={formatOdds(bet.price)} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeFromBettingSlip(bet.id)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Monto de la apuesta */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Monto a apostar"
          type="number"
          value={betAmount}
          onChange={handleBetAmountChange}
          fullWidth
          size="small"
          inputProps={{ min: 0, step: 1 }}
          helperText={`Saldo disponible: ${user?.balance?.toFixed(2) || '0.00'} USDT`}
        />
      </Box>

      {/* Resumen de la apuesta */}
      <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Selecciones:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {bettingSlip.length}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Cuota total:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {totalOdds.toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Apuesta:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(betAmount)} USDT
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1, backgroundColor: 'primary.main' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Ganancia potencial:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            {formatCurrency(potentialWin)} USDT
          </Typography>
        </Box>
      </Box>

      {/* Validaciones */}
      {isAuthenticated && betAmount > user?.balance && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Saldo insuficiente. Tu saldo actual es {user?.balance?.toFixed(2)} USDT
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debes iniciar sesión para realizar apuestas
        </Alert>
      )}

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmitBet}
          disabled={!isAuthenticated || loading || betAmount <= 0 || betAmount > (user?.balance || 0)}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Procesando...' : `Apostar ${formatCurrency(betAmount)} USDT`}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={clearBettingSlip}
          disabled={loading}
        >
          Limpiar Boleto
        </Button>
      </Box>
    </Box>
  );
};

export default BettingSlip;