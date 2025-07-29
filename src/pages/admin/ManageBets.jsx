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
  Collapse,
  Divider
} from '@mui/material';
import {
  Search,
  ExpandMore,
  ExpandLess,
  Receipt,
  TrendingUp,
  TrendingDown,
  Pending,
  CheckCircle,
  Cancel,
  Visibility,
  Edit
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import Loading from '../../components/common/Loading';
import axios from 'axios';

const ManageBets = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBets, setTotalBets] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [expandedBet, setExpandedBet] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    totalBets: 0,
    pendingBets: 0,
    wonBets: 0,
    lostBets: 0,
    totalStaked: 0,
    totalPayout: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchBets();
  }, [page, rowsPerPage, statusFilter, dateFrom, dateTo]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });
      
      if (searchTerm) params.append('username', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());

      const response = await axios.get(
        `${API_URL}/bets/admin/all?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setBets(response.data.data.tickets);
      setTotalBets(response.data.data.pagination.total);
      
      // Calcular estadísticas
      calculateStatistics(response.data.data.tickets);
    } catch (error) {
      enqueueSnackbar('Error al cargar apuestas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (betsData) => {
    const stats = betsData.reduce((acc, bet) => {
      acc.totalBets += 1;
      acc.totalStaked += parseFloat(bet.stake_amount);
      
      if (bet.status === 'won') {
        acc.wonBets += 1;
        acc.totalPayout += parseFloat(bet.potential_payout);
      } else if (bet.status === 'lost') {
        acc.lostBets += 1;
      } else if (bet.status === 'pending') {
        acc.pendingBets += 1;
      }
      
      return acc;
    }, {
      totalBets: 0,
      pendingBets: 0,
      wonBets: 0,
      lostBets: 0,
      totalStaked: 0,
      totalPayout: 0
    });
    
    stats.revenue = stats.totalStaked - stats.totalPayout;
    setStatistics(stats);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleExpandBet = (betId) => {
    setExpandedBet(expandedBet === betId ? null : betId);
  };

  const handleViewBet = (bet) => {
    setSelectedBet(bet);
    setViewDialogOpen(true);
  };

  const handleUpdateBetStatus = async (betId, newStatus) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/bets/admin/${betId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      enqueueSnackbar('Estado de apuesta actualizado', { variant: 'success' });
      fetchBets();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al actualizar apuesta',
        { variant: 'error' }
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'lost':
        return <Cancel sx={{ color: 'error.main' }} />;
      case 'pending':
        return <Pending sx={{ color: 'warning.main' }} />;
      default:
        return <Receipt sx={{ color: 'text.secondary' }} />;
    }
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

  const getStatusText = (status) => {
    switch (status) {
      case 'won':
        return 'Ganada';
      case 'lost':
        return 'Perdida';
      case 'pending':
        return 'Pendiente';
      case 'canceled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const formatOdds = (odds) => {
    return parseFloat(odds || 0).toFixed(2);
  };

  if (loading && bets.length === 0) {
    return <Loading message="Cargando apuestas..." />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
              Gestión de Apuestas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra todas las apuestas de la plataforma
            </Typography>
          </Paper>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Receipt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statistics.totalBets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Apuestas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Pending sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statistics.pendingBets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(statistics.totalStaked)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Apostado (USDT)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: statistics.revenue >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {statistics.revenue >= 0 ? '+' : ''}{formatCurrency(statistics.revenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresos (USDT)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar por usuario"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Estado"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="pending">Pendientes</MenuItem>
                    <MenuItem value="won">Ganadas</MenuItem>
                    <MenuItem value="lost">Perdidas</MenuItem>
                    <MenuItem value="canceled">Canceladas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Fecha desde"
                  value={dateFrom}
                  onChange={setDateFrom}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Fecha hasta"
                  value={dateTo}
                  onChange={setDateTo}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFrom(null);
                      setDateTo(null);
                      setPage(0);
                    }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={fetchBets}
                    fullWidth
                  >
                    Buscar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Bets Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Selecciones</TableCell>
                    <TableCell align="right">Cuota</TableCell>
                    <TableCell align="right">Apuesta</TableCell>
                    <TableCell align="right">Ganancia Potencial</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bets.map((bet) => (
                    <React.Fragment key={bet.id}>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {bet.username}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {format(new Date(bet.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {bet.selections?.length || 0} selección{bet.selections?.length !== 1 ? 'es' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatOdds(bet.total_odds)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(bet.stake_amount)} USDT
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: bet.status === 'won' ? 'success.main' : 'text.primary'
                            }}
                          >
                            {formatCurrency(bet.potential_payout)} USDT
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getStatusIcon(bet.status)}
                            label={getStatusText(bet.status)}
                            color={getStatusColor(bet.status)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewBet(bet)}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => toggleExpandBet(bet.id)}
                            >
                              {expandedBet === bet.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Details */}
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0 }}>
                          <Collapse in={expandedBet === bet.id}>
                            <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                              <Typography variant="h6" sx={{ mb: 2 }}>
                                Detalles de la Apuesta #{bet.id}
                              </Typography>
                              
                              {bet.selections && bet.selections.length > 0 ? (
                                bet.selections.map((selection, index) => (
                                  <Card key={index} sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {selection.home_team} vs {selection.away_team}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {format(new Date(selection.commence_time), 'dd/MM/yyyy HH:mm', { locale: es })}
                                          </Typography>
                                        </Grid>
                                        
                                        <Grid item xs={12} md={3}>
                                          <Typography variant="body2">
                                            <strong>Selección:</strong> {selection.selection}
                                          </Typography>
                                        </Grid>
                                        
                                        <Grid item xs={12} md={2}>
                                          <Typography variant="body2">
                                            <strong>Cuota:</strong> {formatOdds(selection.odds_value)}
                                          </Typography>
                                        </Grid>
                                        
                                        <Grid item xs={12} md={2}>
                                          <Chip
                                            label={getStatusText(selection.status)}
                                            color={getStatusColor(selection.status)}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </Grid>
                                        
                                        <Grid item xs={12} md={1}>
                                          {bet.status === 'pending' && (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                              <Button
                                                size="small"
                                                color="success"
                                                onClick={() => handleUpdateBetStatus(bet.id, 'won')}
                                              >
                                                Ganar
                                              </Button>
                                              <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleUpdateBetStatus(bet.id, 'lost')}
                                              >
                                                Perder
                                              </Button>
                                            </Box>
                                          )}
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <Alert severity="info">
                                  No hay detalles disponibles para esta apuesta
                                </Alert>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalBets}
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

        {/* View Bet Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Detalles de la Apuesta #{selectedBet?.id}
          </DialogTitle>
          <DialogContent>
            {selectedBet && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Usuario</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedBet.username}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Fecha</Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedBet.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cuota Total</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatOdds(selectedBet.total_odds)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Monto Apostado</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(selectedBet.stake_amount)} USDT
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Ganancia Potencial</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(selectedBet.potential_payout)} USDT
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Estado</Typography>
                  <Chip
                    icon={getStatusIcon(selectedBet.status)}
                    label={getStatusText(selectedBet.status)}
                    color={getStatusColor(selectedBet.status)}
                    variant="outlined"
                  />
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
      </Container>
    </LocalizationProvider>
  );
};

export default ManageBets;