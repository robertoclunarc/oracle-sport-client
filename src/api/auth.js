import api from './index';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/users/change-password', passwordData);
  return response.data;
};