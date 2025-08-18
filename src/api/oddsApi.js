import api from './index';

// Obtener deportes disponibles desde Odds API
export const getSportsFromAPI = async () => {
  try {
    const response = await api.get('/odds-api/sports');
    return response.data.data;
  } catch (error) {
    console.error('Error obteniendo deportes de API:', error);
    throw error;
  }
};

// Obtener eventos por deporte desde Odds API
export const getEventsBySport = async (sportKey) => {
  try {
    const response = await api.get(`/odds-api/events/${sportKey}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error obteniendo eventos para ${sportKey}:`, error);
    throw error;
  }
};

// Sincronizar todos los deportes principales (solo admin)
export const syncAllSports = async () => {
  try {
    const response = await api.post('/odds-api/sync/all');
    return response.data;
  } catch (error) {
    console.error('Error sincronizando deportes:', error);
    throw error;
  }
};

// Obtener información de uso de la API (solo admin)
export const getApiUsage = async () => {
  try {
    const response = await api.get('/odds-api/usage');
    return response.data.data;
  } catch (error) {
    console.error('Error obteniendo uso de API:', error);
    throw error;
  }
};

// Validar evento específico
export const validateEvent = async (apiEventId) => {
  try {
    const response = await api.post(`/odds-api/validate/${apiEventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error validando evento ${apiEventId}:`, error);
    throw error;
  }
};

// Transformar datos de la API para el frontend
export const transformApiEventForFrontend = (apiEvent) => {
  return {
    id: apiEvent.api_event_id,
    api_event_id: apiEvent.api_event_id,
    sport: apiEvent.sport_key,
    home_team: apiEvent.home_team,
    away_team: apiEvent.away_team,
    commence_time: apiEvent.commence_time,
    odds: apiEvent.odds || []
  };
};