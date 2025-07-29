import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Dashboard,
  People,
  Receipt,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Pending,
  CheckCircle,
  Cancel,
  Warning,
  Refresh,
  Sports
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Loading from '../../components/common/Loading';
import axios from 'axios';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalUsers: 0,
      totalBets: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      todayRevenue: 0,
      monthlyRevenue: 0
    },
    recentBets: [],
    pendingDeposits: [],
    pendingWithdrawals: [],
    systemAlerts: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const headers = { 'Authorization': `Bearer ${token}` };

      // Obtener todas las estadísticas en paralelo
      const [
        usersResponse,
        betsResponse,
        depositsResponse,
        withdrawalsResponse,
        pendingDepositsResponse,
        pendingWithdrawalsResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/users/admin/users?limit=1`, { headers }),
        axios.get(`${API_URL}/bets/admin/all?limit=10`, { headers }),
        axios.get(`${API_URL}/deposits/admin/all?limit=1`, { headers }),
        axios.get(`${API_URL}/withdrawals/admin/all?limit=1`, { headers }),
        axios.get(`${API_URL}/deposits/admin/all?status=pending&limit=5`, { headers }),
        axios.get(`${API_URL}/withdrawals/admin/all?status=pending&limit=5`, { headers })
      ]);

      const statistics = {
        totalUsers: usersResponse.data.data.pagination.total,
        totalBets: betsResponse.data.data.pagination.total,
        totalDeposits: depositsResponse.data.data.pagination.total,
        totalWithdrawals: withdrawalsResponse.data.data.pagination.total,
        pendingDeposits: pendingDepositsResponse.data.data.pagination.total,
        pendingWithdrawals: pendingWithdrawalsResponse.data.data.pagination.total,
        todayRevenue: 0, // Calcular basado en apuestas del día
        monthlyRevenue: 0 // Calcular basado en apuestas del mes
      };

      setDashboardData({
        statistics,
        recentBets: betsResponse.data.data.tickets.slice(0, 5),
        pendingDeposits: pendingDepositsResponse.data.data.deposits,
        pendingWithdrawals: pendingWithdrawalsResponse.data.data.withdrawals,
        systemAlerts: generateSystemAlerts(statistics)
      });

    } catch (err) {
      setError('Error al cargar datos del dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSystemAlerts = (stats) => {
    const alerts = [];
    
    if (stats.pendingDeposits > 10) {
      alerts.push({
        type: 'warning',
        message: `Hay ${stats.pendingDeposits} depósitos pendientes por revisar`,
        action: 'Ver Depósitos',
        link: '/admin/deposits'
      });
    }
    
    if (stats.pendingWithdrawals > 5) {
      alerts.push({
        type: 'error',
        message: `Hay ${stats.pendingWithdrawals} retiros pendientes por procesar`,
        action: 'Ver Retiros',
        link: '/admin/withdrawals'
      });
    }
    
    return alerts;
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'won':
        return 'success';
      case 'lost':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Loading message="Cargando dashboard administrativo..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                Panel de Administración
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bienvenido al dashboard administrativo de Oracle Sport
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchDashboardData}
            >
              Actualizar
            </Button>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* System Alerts */}
        {dashboardData.systemAlerts.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Alertas del Sistema
            </Typography>
            {dashboardData.systemAlerts.map((alert, index) => (
              <Alert 
                key={index}
                severity={alert.type}
                action={
                  <Button color="inherit" size="small" component={RouterLink} to={alert.link}>
                    {alert.action}
                  </Button>
                }
                sx={{ mb: 1 }}
              >
                {alert.message}
              </Alert>
            ))}
          </Paper>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardData.statistics.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios Totales
                </Typography>
                <Button
                  size="small"
                  component={RouterLink}
                  to="/admin/users"
                  sx={{ mt: 1 }}
                >
                  Ver Usuarios
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Receipt sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardData.statistics.totalBets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Apuestas Totales
                </Typography>
                <Button
                  size="small"
                  component={RouterLink}
                  to="/admin/bets"
                  sx={{ mt: 1 }}
                >
                  Ver Apuestas
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardData.statistics.totalDeposits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Depósitos Totales
                </Typography>
                {dashboardData.statistics.pendingDeposits > 0 && (
                  <Chip
                    label={`${dashboardData.statistics.pendingDeposits} pendientes`}
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingDown sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardData.statistics.totalWithdrawals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Retiros Totales
                </Typography>
                {dashboardData.statistics.pendingWithdrawals > 0 && (
                  <Chip
                    label={`${dashboardData.statistics.pendingWithdrawals} pendientes`}
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Bets */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Apuestas Recientes
                </Typography>
                <Button
                  component={RouterLink}
                  to="/admin/bets"
                  size="small"
                >
                  Ver Todas
                </Button>
              </Box>

              {dashboardData.recentBets.length === 0 ? (
                <Alert severity="info">
                  No hay apuestas recientes
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Apuesta</TableCell>
                        <TableCell align="right">Cuota</TableCell>
                        <TableCell align="center">Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recentBets.map((bet) => (
                        <TableRow key={bet.id}>
                          <TableCell>{bet.username}</TableCell>
                          <TableCell>
                            {format(new Date(bet.created_at), 'dd/MM HH:mm', { locale: es })}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(bet.stake_amount)} USDT
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(bet.total_odds).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={bet.status}
                              color={getStatusColor(bet.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* Pending Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Acciones Pendientes
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Pending color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Depósitos Pendientes"
                    secondary={`${dashboardData.statistics.pendingDeposits} por revisar`}
                  />
                  <Button size="small" component={RouterLink} to="/admin/deposits">
                    Ver
                  </Button>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <AttachMoney color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Retiros Pendientes"
                    secondary={`${dashboardData.statistics.pendingWithdrawals} por procesar`}
                  />
                  <Button size="small" component={RouterLink} to="/admin/withdrawals">
                    Ver
                  </Button>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Sports color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestionar Deportes"
                    secondary="Configurar eventos y cuotas"
                  />
                  <Button size="small" component={RouterLink} to="/admin/sports">
                    Ver
                  </Button>
                </ListItem>
              </List>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Acciones Rápidas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    component={RouterLink}
                    to="/admin/users"
                  >
                    Gestionar Usuarios
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    component={RouterLink}
                    to="/admin/bets"
                  >
                    Gestionar Apuestas
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AttachMoney />}
                    component={RouterLink}
                    to="/admin/finance"
                  >
                    Finanzas
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Sports />}
                    component={RouterLink}
                    to="/admin/sports"
                  >
                    Deportes y Eventos
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;