import api from './index';

export const placeBet = async (betData) => {
  const response = await api.post('/bets', betData);
  return response.data.data;
};

export const getUserBets = async (page = 1, limit = 10) => {
  const response = await api.get(`/bets?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getBetById = async (betId) => {
  const response = await api.get(`/bets/${betId}`);
  return response.data.data;
};

// Crear nueva apuesta
export const createTicket = async (betData) => {
  try {
    console.log('Creating ticket with data:', betData);
    const response = await api.post('/tickets', betData);
    return response.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

// Obtener historial de apuestas del usuario
export const getUserTickets = async (page = 1, limit = 10, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await api.get(`/tickets?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

// Obtener detalles de una apuesta específica
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

// Obtener estadísticas de apuestas del usuario
export const getUserBettingStats = async () => {
  try {
    const response = await api.get('/tickets/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching betting stats:', error);
    throw error;
  }
};