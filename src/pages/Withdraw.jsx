import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AccountBalance,
  CurrencyBitcoin,
  Phone,
  Add,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthContext from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const validationSchema = yup.object({
  amount: yup
    .number()
    .min(1, 'El monto mínimo es 1 USDT')
    .required('El monto es requerido'),
  method: yup
    .string()
    .required('Selecciona un método de retiro'),
  bank_detail_id: yup
    .number()
    .when('method', {
      is: 'mobile_payment',
      then: (schema) => schema.required('Selecciona una cuenta bancaria'),
      otherwise: (schema) => schema.notRequired()
    }),
  crypto_detail_id: yup
    .number()
    .when('method', {
      is: 'binance',
      then: (schema) => schema.required('Selecciona una wallet'),
      otherwise: (schema) => schema.notRequired()
    })
});

const withdrawMethods = [
  {
    id: 'mobile_payment',
    name: 'Pago Móvil',
    icon: <Phone />,
    description: 'Retiro vía pago móvil',
    minAmount: 5,
    processingTime: '1-24 horas',
    fee: '2%'
  },
  {
    id: 'binance',
    name: 'Binance (USDT)',
    icon: <CurrencyBitcoin />,
    description: 'Transferencia a Binance',
    minAmount: 1,
    processingTime: '5-30 minutos',
    fee: '1 USDT'
  }
];

const steps = ['Seleccionar Método', 'Elegir Destino', 'Confirmar'];

const Withdraw = () => {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [bankDetails, setBankDetails] = useState([]);
  const [cryptoDetails, setCryptoDetails] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState('');

  const formik = useFormik({
    initialValues: {
      amount: '',
      method: '',
      bank_detail_id: '',
      crypto_detail_id: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        
        const response = await axios.post(`${API_URL}/withdrawals`, values, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setWithdrawSuccess(true);
        enqueueSnackbar('Solicitud de retiro enviada exitosamente', { variant: 'success' });
        
        // Reset form
        formik.resetForm();
        setActiveStep(0);
        setSelectedMethod(null);
        
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Error al procesar el retiro', 
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Cargar detalles bancarios y de cripto
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        
        const [bankResponse, cryptoResponse] = await Promise.all([
          axios.get(`${API_URL}/users/bank-details`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/users/crypto-details`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setBankDetails(bankResponse.data.data);
        setCryptoDetails(cryptoResponse.data.data);
      } catch (error) {
        console.error('Error loading payment details:', error);
      }
    };

    fetchPaymentDetails();
  }, []);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    formik.setFieldValue('method', method.id);
    setActiveStep(1);
  };

  const handleNext = () => {
    if (activeStep === 1) {
      const hasValidDestination = 
        (formik.values.method === 'mobile_payment' && formik.values.bank_detail_id) ||
        (formik.values.method === 'binance' && formik.values.crypto_detail_id);
        
      if (hasValidDestination) {
        setActiveStep(2);
      } else {
        enqueueSnackbar('Por favor selecciona un destino para el retiro', { variant: 'warning' });
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    if (activeStep === 1) {
      setSelectedMethod(null);
      formik.setFieldValue('method', '');
    }
  };

  const calculateFee = (amount, method) => {
    if (!amount || !method) return 0;
    
    const numAmount = parseFloat(amount);
    if (method.id === 'mobile_payment') {
      return numAmount * 0.02; // 2%
    } else if (method.id === 'binance') {
      return 1; // 1 USDT fijo
    }
    return 0;
  };

  const calculateTotal = (amount, method) => {
    const numAmount = parseFloat(amount || 0);
    const fee = calculateFee(amount, method);
    return numAmount - fee;
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  if (withdrawSuccess) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Paper sx={{ p: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              ¡Retiro Solicitado!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Tu solicitud de retiro ha sido enviada y está siendo procesada.
              Los fondos serán enviados una vez aprobada la solicitud.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setWithdrawSuccess(false)}
            >
              Realizar Otro Retiro
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Realizar Retiro
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Retira tus fondos de forma segura
          </Typography>

          {/* User Balance */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography>
              Tu saldo disponible: <strong>{user?.balance?.toFixed(2)} USDT</strong>
            </Typography>
          </Alert>

          {/* Warning about minimum balance */}
          {user?.balance < 5 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography>
                El saldo mínimo para retiros es 5 USDT. Necesitas depositar más fondos.
              </Typography>
            </Alert>
          )}

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Method Selection */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Selecciona tu método de retiro
              </Typography>
              <Grid container spacing={3}>
                {withdrawMethods.map((method) => (
                  <Grid item xs={12} md={6} key={method.id}>
                    <Card 
                      sx={{ 
                        cursor: user?.balance >= method.minAmount ? 'pointer' : 'not-allowed',
                        opacity: user?.balance >= method.minAmount ? 1 : 0.6,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: user?.balance >= method.minAmount ? 'translateY(-4px)' : 'none',
                          boxShadow: user?.balance >= method.minAmount ? 4 : 1
                        }
                      }}
                      onClick={() => {
                        if (user?.balance >= method.minAmount) {
                          handleMethodSelect(method);
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Box sx={{ color: 'primary.main', mb: 2 }}>
                          {React.cloneElement(method.icon, { sx: { fontSize: 48 } })}
                        </Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {method.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {method.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={`Mín: ${method.minAmount} USDT`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip 
                            label={`Comisión: ${method.fee}`} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Procesamiento: {method.processingTime}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Step 2: Destination Selection */}
          {activeStep === 1 && selectedMethod && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Monto y destino - {selectedMethod.name}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monto a retirar"
                    name="amount"
                    type="number"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                    InputProps={{
                      endAdornment: <Typography variant="body2">USDT</Typography>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  {/* Calculation Display */}
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary">
                      Resumen:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Monto:</Typography>
                      <Typography variant="body2">{formatCurrency(formik.values.amount)} USDT</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Comisión:</Typography>
                      <Typography variant="body2">{formatCurrency(calculateFee(formik.values.amount, selectedMethod))} USDT</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Recibirás:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(calculateTotal(formik.values.amount, selectedMethod))} USDT
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Destination Selection */}
                <Grid item xs={12}>
                  {selectedMethod.id === 'mobile_payment' ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Selecciona cuenta bancaria</Typography>
                        <Button
                          startIcon={<Add />}
                          onClick={() => {
                            setAddType('bank');
                            setShowAddDialog(true);
                          }}
                        >
                          Añadir Cuenta
                        </Button>
                      </Box>
                      
                      {bankDetails.length === 0 ? (
                        <Alert severity="warning">
                          No tienes cuentas bancarias registradas. Añade una para continuar.
                        </Alert>
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel>Cuenta Bancaria</InputLabel>
                          <Select
                            name="bank_detail_id"
                            value={formik.values.bank_detail_id}
                            label="Cuenta Bancaria"
                            onChange={formik.handleChange}
                          >
                            {bankDetails.map((bank) => (
                              <MenuItem key={bank.id} value={bank.id}>
                                {bank.bank_name} - {bank.account_number} ({bank.registered_phone})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Selecciona wallet</Typography>
                        <Button
                          startIcon={<Add />}
                          onClick={() => {
                            setAddType('crypto');
                            setShowAddDialog(true);
                          }}
                        >
                          Añadir Wallet
                        </Button>
                      </Box>
                      
                      {cryptoDetails.length === 0 ? (
                        <Alert severity="warning">
                          No tienes wallets registradas. Añade una para continuar.
                        </Alert>
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel>Wallet</InputLabel>
                          <Select
                            name="crypto_detail_id"
                            value={formik.values.crypto_detail_id}
                            label="Wallet"
                            onChange={formik.handleChange}
                          >
                            {cryptoDetails.map((crypto) => (
                              <MenuItem key={crypto.id} value={crypto.id}>
                                {crypto.wallet_address} ({crypto.network})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Volver
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={!formik.values.amount || calculateTotal(formik.values.amount, selectedMethod) <= 0}
                >
                  Continuar
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 3: Confirmation */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Confirmar Retiro
              </Typography>
              
              <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Método:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedMethod?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Monto solicitado:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(formik.values.amount)} USDT
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Comisión:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      -{formatCurrency(calculateFee(formik.values.amount, selectedMethod))} USDT
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Recibirás:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {formatCurrency(calculateTotal(formik.values.amount, selectedMethod))} USDT
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Una vez confirmado, el retiro no puede ser cancelado. 
                  Verifica que toda la información sea correcta.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack}>
                  Volver
                </Button>
                <Button 
                  variant="contained" 
                  onClick={formik.handleSubmit}
                  disabled={loading}
                  color="warning"
                >
                  {loading ? 'Procesando...' : 'Confirmar Retiro'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Añadir {addType === 'bank' ? 'Cuenta Bancaria' : 'Wallet'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Esta funcionalidad te redirigirá a tu perfil para añadir nuevos métodos de pago.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setShowAddDialog(false);
              // Aquí podrías redirigir al perfil o abrir un formulario
            }}
          >
            Ir a Perfil
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Withdraw;