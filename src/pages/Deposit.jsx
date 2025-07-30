import React, { useState, useContext } from 'react';
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
  Chip
} from '@mui/material';
import {
  AccountBalance,
  CurrencyBitcoin,
  Phone,
  Upload,
  CheckCircle
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
    .required('Selecciona un método de depósito'),
  reference_number: yup
    .string()
    .when('method', {
      is: (method) => method === 'bank_transfer' || method === 'mobile_payment',
      then: (schema) => schema.required('El número de referencia es requerido'),
      otherwise: (schema) => schema.notRequired()
    }),
  transaction_hash: yup
    .string()
    .when('method', {
      is: 'binance',
      then: (schema) => schema.required('El hash de transacción es requerido'),
      otherwise: (schema) => schema.notRequired()
    }),
  deposit_date: yup
    .date()
    .required('La fecha de depósito es requerida')
});

const depositMethods = [
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    icon: <AccountBalance />,
    description: 'Transferencia desde tu cuenta bancaria',
    minAmount: 10,
    processingTime: '1-3 días hábiles'
  },
  {
    id: 'mobile_payment',
    name: 'Pago Móvil',
    icon: <Phone />,
    description: 'Pago móvil interbancario',
    minAmount: 5,
    processingTime: '1-24 horas'
  },
  {
    id: 'binance',
    name: 'Binance (USDT)',
    icon: <CurrencyBitcoin />,
    description: 'Transferencia directa desde Binance',
    minAmount: 1,
    processingTime: '5-30 minutos'
  }
];

const steps = ['Seleccionar Método', 'Ingresar Detalles', 'Confirmar'];

const Deposit = () => {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      amount: '',
      method: '',
      reference_number: '',
      transaction_hash: '',
      deposit_date: new Date(),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        
        const response = await axios.post(`${API_URL}/deposits`, values, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setDepositSuccess(true);
        enqueueSnackbar('Solicitud de depósito enviada exitosamente', { variant: 'success' });
        
        // Reset form
        formik.resetForm();
        setActiveStep(0);
        setSelectedMethod(null);
        
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Error al procesar el depósito', 
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    formik.setFieldValue('method', method.id);
    setActiveStep(1);
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validar campos antes de continuar
      if (formik.values.amount && 
          ((formik.values.method !== 'binance' && formik.values.reference_number) ||
           (formik.values.method === 'binance' && formik.values.transaction_hash))) {
        setActiveStep(2);
      } else {
        enqueueSnackbar('Por favor completa todos los campos requeridos', { variant: 'warning' });
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

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  if (depositSuccess) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Paper sx={{ p: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              ¡Depósito Enviado!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Tu solicitud de depósito ha sido enviada y está siendo procesada.
              Recibirás una confirmación cuando sea aprobada.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setDepositSuccess(false)}
            >
              Realizar Otro Depósito
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
              Realizar Depósito
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Añade fondos a tu cuenta para comenzar a apostar
            </Typography>

            {/* User Balance */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography>
                Tu saldo actual: <strong>{Number(user?.balance || 0).toFixed(2)} USDT</strong>
              </Typography>
            </Alert>

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
                  Selecciona tu método de depósito
                </Typography>
                <Grid container spacing={3}>
                  {depositMethods.map((method) => (
                    <Grid item xs={12} md={4} key={method.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => handleMethodSelect(method)}
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
                          <Chip 
                            label={`Mín: ${method.minAmount} USDT`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
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

            {/* Step 2: Deposit Details */}
            {activeStep === 1 && selectedMethod && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Detalles del depósito - {selectedMethod.name}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Monto a depositar"
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
                    <DatePicker
                      label="Fecha del depósito"
                      value={formik.values.deposit_date}
                      onChange={(newValue) => {
                        formik.setFieldValue('deposit_date', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth
                          error={formik.touched.deposit_date && Boolean(formik.errors.deposit_date)}
                          helperText={formik.touched.deposit_date && formik.errors.deposit_date}
                        />
                      )}
                    />
                  </Grid>

                  {selectedMethod.id === 'binance' ? (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Hash de Transacción"
                        name="transaction_hash"
                        value={formik.values.transaction_hash}
                        onChange={formik.handleChange}
                        error={formik.touched.transaction_hash && Boolean(formik.errors.transaction_hash)}
                        helperText={formik.touched.transaction_hash && formik.errors.transaction_hash}
                        placeholder="Ingresa el hash de tu transacción de Binance"
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Número de Referencia"
                        name="reference_number"
                        value={formik.values.reference_number}
                        onChange={formik.handleChange}
                        error={formik.touched.reference_number && Boolean(formik.errors.reference_number)}
                        helperText={formik.touched.reference_number && formik.errors.reference_number}
                        placeholder="Número de referencia de la transferencia"
                      />
                    </Grid>
                  )}
                </Grid>

                {/* Instructions */}
                <Paper sx={{ p: 3, mt: 3, backgroundColor: 'primary.light' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Instrucciones para {selectedMethod.name}
                  </Typography>
                  {selectedMethod.id === 'binance' && (
                    <Box>
                      <Typography variant="body2" paragraph>
                        1. Realiza la transferencia USDT desde tu cuenta Binance a nuestra wallet
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. Copia el hash de transacción una vez completada
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. Pega el hash en el campo correspondiente
                      </Typography>
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Wallet USDT (TRC20): <code>TRX7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF</code>
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                  
                  {(selectedMethod.id === 'bank_transfer' || selectedMethod.id === 'mobile_payment') && (
                    <Box>
                      <Typography variant="body2" paragraph>
                        1. Realiza la transferencia a nuestras cuentas bancarias
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. Guarda el número de referencia de la operación
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. Ingresa el número de referencia en el formulario
                      </Typography>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Contacta a nuestro soporte para obtener los datos bancarios actualizados
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button onClick={handleBack}>
                    Volver
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    disabled={!formik.values.amount}
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
                  Confirmar Depósito
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
                        Monto:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(formik.values.amount)} USDT
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formik.values.deposit_date?.toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Referencia:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formik.values.reference_number || formik.values.transaction_hash}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Tu solicitud será revisada y aprobada en un plazo de {selectedMethod?.processingTime}. 
                  Una vez aprobada, el monto se agregará automáticamente a tu saldo.
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Volver
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={formik.handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Confirmar Depósito'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default Deposit;