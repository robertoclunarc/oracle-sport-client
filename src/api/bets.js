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