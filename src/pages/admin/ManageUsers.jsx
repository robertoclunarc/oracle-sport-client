import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
  Person,
  AdminPanelSettings,
  Block,
  CheckCircle,
  AttachMoney,
  Visibility
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import Loading from '../../components/common/Loading';
import axios from 'axios';

const editUserValidationSchema = yup.object({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  phone: yup.string().required('El teléfono es requerido'),
  country: yup.string().required('El país es requerido'),
  role: yup.string().oneOf(['user', 'admin']).required('El rol es requerido'),
  balance: yup.number().min(0, 'El saldo no puede ser negativo').required('El saldo es requerido')
});

const ManageUsers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      country: '',
      role: 'user',
      balance: 0
    },
    validationSchema: editUserValidationSchema,
    onSubmit: async (values) => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        
        await axios.put(
          `${API_URL}/users/admin/users/${selectedUser.id}`,
          values,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        enqueueSnackbar('Usuario actualizado exitosamente', { variant: 'success' });
        setEditDialogOpen(false);
        fetchUsers();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Error al actualizar usuario',
          { variant: 'error' }
        );
      }
    }
  });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await axios.get(
        `${API_URL}/users/admin/users?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setUsers(response.data.data.users);
      setTotalUsers(response.data.data.pagination.total);
    } catch (error) {
      enqueueSnackbar('Error al cargar usuarios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setActionUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionUserId(null);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    formik.setValues({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      role: user.role || 'user',
      balance: user.balance || 0
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${API_URL}/users/admin/users/${selectedUser.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      enqueueSnackbar('Usuario eliminado exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al eliminar usuario',
        { variant: 'error' }
      );
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'primary';
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <AdminPanelSettings /> : <Person />;
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  if (loading && users.length === 0) {
    return <Loading message="Cargando usuarios..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                Gestión de Usuarios
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Administra todos los usuarios de la plataforma
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* Implementar crear usuario */}}
            >
              Nuevo Usuario
            </Button>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Usuarios
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {users.filter(u => u.role === 'admin').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {users.filter(u => u.role === 'user').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(users.reduce((sum, user) => sum + (user.balance || 0), 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saldo Total (USDT)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Buscar usuario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por rol</InputLabel>
                <Select
                  value={roleFilter}
                  label="Filtrar por rol"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="user">Usuarios</MenuItem>
                  <MenuItem value="admin">Administradores</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setPage(0);
                  }}
                >
                  Limpiar Filtros
                </Button>
                <Button
                  variant="contained"
                  onClick={fetchUsers}
                >
                  Buscar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Users Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>País</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell align="center">Rol</TableCell>
                  <TableCell>Fecha Registro</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.first_name} {user.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(user.balance)} USDT
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role === 'admin' ? 'Admin' : 'Usuario'}
                        color={getRoleColor(user.role)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </Paper>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItem onClick={() => handleViewUser(users.find(u => u.id === actionUserId))}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver Detalles</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => handleEditUser(users.find(u => u.id === actionUserId))}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={() => {
              setSelectedUser(users.find(u => u.id === actionUserId));
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles del Usuario
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Nombre de Usuario</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedUser.username}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Nombre Completo</Typography>
                <Typography variant="body1">{selectedUser.first_name} {selectedUser.last_name}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                <Typography variant="body1">{selectedUser.phone}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">País</Typography>
                <Typography variant="body1">{selectedUser.country}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Identificación</Typography>
                <Typography variant="body1">{selectedUser.identification_number}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Saldo</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(selectedUser.balance)} USDT
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Rol</Typography>
                <Chip
                  icon={getRoleIcon(selectedUser.role)}
                  label={selectedUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                  color={getRoleColor(selectedUser.role)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Fecha de Registro</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedUser.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Última Actualización</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedUser.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Editar Usuario
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="first_name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="last_name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="País"
                  name="country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  error={formik.touched.country && Boolean(formik.errors.country)}
                  helperText={formik.touched.country && formik.errors.country}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="role"
                    value={formik.values.role}
                    label="Rol"
                    onChange={formik.handleChange}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                  >
                    <MenuItem value="user">Usuario</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Saldo (USDT)"
                  name="balance"
                  type="number"
                  value={formik.values.balance}
                  onChange={formik.handleChange}
                  error={formik.touched.balance && Boolean(formik.errors.balance)}
                  helperText={formik.touched.balance && formik.errors.balance}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={formik.handleSubmit} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
          <Typography>
            ¿Estás seguro de que quieres eliminar al usuario <strong>{selectedUser?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers;