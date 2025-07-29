import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthContext from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const validationSchema = yup.object({
  username: yup
    .string('Ingresa tu nombre de usuario')
    .required('El nombre de usuario es requerido'),
  password: yup
    .string('Ingresa tu contraseña')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, loading, error } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await loginUser(values);
        enqueueSnackbar('¡Bienvenido a Oracle Sport!', { variant: 'success' });
        navigate(from, { replace: true });
      } catch (err) {
        // El error ya se maneja en el contexto
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
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
              Iniciar Sesión
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Nombre de Usuario"
              name="username"
              autoComplete="username"
              autoFocus
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
            
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
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
                'Iniciar Sesión'
              )}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                ¿No tienes una cuenta?{' '}
                <Link component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Información adicional */}
        <Paper elevation={1} sx={{ mt: 3, p: 3, width: '100%', backgroundColor: 'primary.light' }}>
          <Typography variant="h6" gutterBottom>
            ¿Por qué elegir Oracle Sport?
          </Typography>
          <Typography variant="body2" paragraph>
            • Las mejores cuotas del mercado
          </Typography>
          <Typography variant="body2" paragraph>
            • Depósitos y retiros seguros
          </Typography>
          <Typography variant="body2" paragraph>
            • Soporte 24/7
          </Typography>
          <Typography variant="body2">
            • Cobertura completa de MLB, NBA, NFL y más
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;