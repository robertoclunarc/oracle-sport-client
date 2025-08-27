import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Receipt,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Cancel,
  Pending
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AuthContext from '../contexts/AuthContext';
import { getUserBets } from '../api/bets';
import Loading from '../components/common/Loading';

const BetHistory = () => {
  const { user } = useContext(AuthContext);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBets, setTotalBets] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedBet, setExpandedBet] = useState(null);
  const [statistics, setStatistics] = useState({
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    pendingBets: 0,
    totalStaked: 0,
    totalWon: 0,
    profitLoss: 0
  });

  useEffect(() => {
    fetchBets();
  }, [page, rowsPerPage, statusFilter]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const response = await getUserBets(page + 1, rowsPerPage, statusFilter !== 'all' ? statusFilter : undefined);
      
      setBets(response.tickets || []);
      setTotalBets(response.pagination?.total || 0);
      
      // Calcular estadísticas
      calculateStatistics(response.tickets || []);
    } catch (err) {
      setError('Error al cargar el historial de apuestas');
      console.error('Error fetching bets:', err);
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
        acc.totalWon += parseFloat(bet.potential_payout);
      } else if (bet.status === 'lost') {
        acc.lostBets += 1;
      } else if (bet.status === 'pending') {
        acc.pendingBets += 1;
      }
      
      return acc;
    }, {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      totalStaked: 0,
      totalWon: 0
    });
    
    stats.profitLoss = stats.totalWon - stats.totalStaked;
    setStatistics(stats);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const toggleExpandBet = (betId) => {
    setExpandedBet(expandedBet === betId ? null : betId);
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
        return <Schedule sx={{ color: 'text.secondary' }} />;
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
    const oddsValue = parseFloat(odds);
    return oddsValue.toFixed(2);
  };

  if (loading && bets.length === 0) {
    return <Loading message="Cargando historial de apuestas..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Historial de Apuestas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Revisa todas tus apuestas y estadísticas
          </Typography>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {statistics.wonBets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Apuestas Ganadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingDown sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {statistics.lostBets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Apuestas Perdidas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: statistics.profitLoss >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {statistics.profitLoss >= 0 ? '+' : ''}{formatCurrency(statistics.profitLoss)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ganancia/Pérdida (USDT)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="won">Ganadas</MenuItem>
                  <MenuItem value="lost">Perdidas</MenuItem>
                  <MenuItem value="canceled">Canceladas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Bets Table */}
        <Paper>
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          {bets.length === 0 && !loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes apuestas aún
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Comienza explorando nuestros eventos deportivos
              </Typography>
              <Button variant="contained" href="/sports">
                Ver Eventos
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Selecciones</TableCell>
                      <TableCell align="right">Cuota</TableCell>
                      <TableCell align="right">Apuesta</TableCell>
                      <TableCell align="right">Ganancia Potencial</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Detalles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bets.map((bet) => (
                      <React.Fragment key={bet.id}>
                        <TableRow>
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
                            <IconButton
                              onClick={() => toggleExpandBet(bet.id)}
                              size="small"
                            >
                              {expandedBet === bet.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Details */}
                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0 }}>
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
                                          <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                              {selection.home_team} vs {selection.away_team}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              {format(new Date(selection.commence_time), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </Typography>
                                          </Grid>
                                          
                                          <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="body2">
                                              <strong>Selección:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                              {selection.selection}
                                            </Typography>
                                          </Grid>
                                          
                                          <Grid size={{ xs: 12, md: 2 }}>
                                            <Typography variant="body2">
                                              <strong>Cuota:</strong>
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                              {formatOdds(selection.odds_value)}
                                            </Typography>
                                          </Grid>
                                          
                                          <Grid size={{ xs: 12, md: 1 }}>
                                            <Chip
                                              label={getStatusText(selection.status)}
                                              color={getStatusColor(selection.status)}
                                              size="small"
                                              variant="outlined"
                                            />
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
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Grid container spacing={2}>
                                  <Grid size={{ xs: 6, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Cuota Total:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                      {formatOdds(bet.total_odds)}
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Apuesta:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                      {formatCurrency(bet.stake_amount)} USDT
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Ganancia Potencial:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                      {formatCurrency(bet.potential_payout)} USDT
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Estado:
                                    </Typography>
                                    <Chip
                                      icon={getStatusIcon(bet.status)}
                                      label={getStatusText(bet.status)}
                                      color={getStatusColor(bet.status)}
                                      size="small"
                                    />
                                  </Grid>
                                </Grid>
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
                rowsPerPageOptions={[5, 10, 25]}
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
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default BetHistory;