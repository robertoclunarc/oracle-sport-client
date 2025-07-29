import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Person, Edit, Save, Cancel } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthContext from '../contexts/AuthContext';
import { updateProfile, changePassword } from '../api/auth';
import { useSnackbar } from 'notistack';

const countries = [
  'Venezuela', 'Colombia', 'México', 'Argentina', 'Chile', 
  'Perú', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia'
];

const profileValidationSchema = yup.object({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  phone: yup.string().required('El teléfono es requerido'),
  country: yup.string().required('El país es requerido'),
});

const passwordValidationSchema = yup.object({
  current_password: yup.string().required('La contraseña actual es requerida'),
  new_password: yup.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').required('La nueva contraseña es requerida'),
  confirm_password: yup.string().oneOf([yup.ref('new_password'), null], 'Las contraseñas deben coincidir').required('La confirmación es requerida'),
});

const Profile = () => {
  const { user, updateUserData } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      country: user?.country || '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const updatedUser = await updateProfile(values);
        updateUserData(updatedUser);
        setEditMode(false);
        enqueueSnackbar('Perfil actualizado exitosamente', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Error al actualizar el perfil', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await changePassword({
          current_password: values.current_password,
          new_password: values.new_password,
        });
        passwordFormik.resetForm();
        enqueueSnackbar('Contraseña actualizada exitosamente', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Error al cambiar la contraseña', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setEditMode(false);
    profileFormik.resetForm();
    passwordFormik.resetForm();
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    profileFormik.resetForm();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main', 
                fontSize: '2rem',
                mr: 3 
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Saldo: {user?.balance?.toFixed(2)} USDT
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Información Personal" />
            <Tab label="Cambiar Contraseña" />
            <Tab label="Estadísticas" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Información Personal
              </Typography>
              {!editMode && (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  variant="outlined"
                >
                  Editar
                </Button>
              )}
            </Box>

            <Box component="form" onSubmit={profileFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="first_name"
                    value={profileFormik.values.first_name}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.first_name && Boolean(profileFormik.errors.first_name)}
                    helperText={profileFormik.touched.first_name && profileFormik.errors.first_name}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="last_name"
                    value={profileFormik.values.last_name}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.last_name && Boolean(profileFormik.errors.last_name)}
                    helperText={profileFormik.touched.last_name && profileFormik.errors.last_name}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre de Usuario"
                    value={user?.username}
                    disabled
                    helperText="El nombre de usuario no se puede cambiar"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileFormik.values.email}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={profileFormik.values.phone}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
                    helperText={profileFormik.touched.phone && profileFormik.errors.phone}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>País</InputLabel>
                    <Select
                      name="country"
                      value={profileFormik.values.country}
                      label="País"
                      onChange={profileFormik.handleChange}
                      error={profileFormik.touched.country && Boolean(profileFormik.errors.country)}
                    >
                      {countries.map((country) => (
                        <MenuItem key={country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Número de Identificación"
                    value={user?.identification_number}
                    disabled
                    helperText="El número de identificación no se puede cambiar"
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Guardar Cambios'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {tabValue === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Cambiar Contraseña
            </Typography>

            <Box component="form" onSubmit={passwordFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña Actual"
                    name="current_password"
                    type="password"
                    value={passwordFormik.values.current_password}
                    onChange={passwordFormik.handleChange}
                    error={passwordFormik.touched.current_password && Boolean(passwordFormik.errors.current_password)}
                    helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    name="new_password"
                    type="password"
                    value={passwordFormik.values.new_password}
                    onChange={passwordFormik.handleChange}
                    error={passwordFormik.touched.new_password && Boolean(passwordFormik.errors.new_password)}
                    helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    name="confirm_password"
                    type="password"
                    value={passwordFormik.values.confirm_password}
                    onChange={passwordFormik.handleChange}
                    error={passwordFormik.touched.confirm_password && Boolean(passwordFormik.errors.confirm_password)}
                    helperText={passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Cambiar Contraseña'}
              </Button>
            </Box>
          </Paper>
        )}

        {tabValue === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Estadísticas de la Cuenta
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {user?.balance?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saldo Actual (USDT)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apuestas Ganadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apuestas Perdidas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Apostado
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              Las estadísticas se actualizarán a medida que realices apuestas en la plataforma.
            </Alert>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Profile;