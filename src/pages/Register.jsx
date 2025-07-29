import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock, 
  Email, 
  Phone,
  CreditCard
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthContext from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const countries = [
  'Venezuela',
  'Colombia',
  'México',
  'Argentina',
  'Chile',
  'Perú',
  'Ecuador',
  'Uruguay',
  'Paraguay',
  'Bolivia'
];

const validationSchema = yup.object({
  username: yup
    .string('Ingresa tu nombre de usuario')
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .required('El nombre de usuario es requerido'),
  password: yup
    .string('Ingresa tu contraseña')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string('Confirma tu contraseña')
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es requerida'),
  first_name: yup
    .string('Ingresa tu nombre')
    .required('El nombre es requerido'),
  last_name: yup
    .string('Ingresa tu apellido')
    .required('El apellido es requerido'),
  identification_number: yup
    .string('Ingresa tu número de identificación')
    .required('El número de identificación es requerido'),
  email: yup
    .string('Ingresa tu email')
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  phone: yup
    .string('Ingresa tu teléfono')
    .required('El teléfono es requerido'),
  country: yup
    .string('Selecciona tu país')
    .required('El país es requerido'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registerUser, loading, error } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      identification_number: '',
      email: '',
      phone: '',
      country: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        await registerUser(registerData);
        enqueueSnackbar('¡Cuenta creada exitosamente! Bienvenido a Oracle Sport', { variant: 'success' });
        navigate('/');
      } catch (err) {
        // El error ya se maneja en el contexto
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ORACLE SPORT
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              Crear Cuenta
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Información personal */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Información Personal
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="first_name"
                  label="Nombre"
                  name="first_name"
                  autoComplete="given-name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="last_name"
                  label="Apellido"
                  name="last_name"
                  autoComplete="family-name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="identification_number"
                  label="Número de Identificación"
                  name="identification_number"
                  value={formik.values.identification_number}
                  onChange={formik.handleChange}
                  error={formik.touched.identification_number && Boolean(formik.errors.identification_number)}
                  helperText={formik.touched.identification_number && formik.errors.identification_number}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="country-label">País</InputLabel>
                  <Select
                    labelId="country-label"
                    id="country"
                    name="country"
                    value={formik.values.country}
                    label="País"
                    onChange={formik.handleChange}
                    error={formik.touched.country && Boolean(formik.errors.country)}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Información de contacto */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Información de Contacto
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Teléfono"
                  name="phone"
                  autoComplete="tel"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Información de la cuenta */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Información de la Cuenta
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  label="Nombre de Usuario"
                  name="username"
                  autoComplete="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Crear Cuenta'
              )}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;