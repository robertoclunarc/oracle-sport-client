import api from './index';

export const getSports = async () => {
  const response = await api.get('/sports');
  return response.data.data;
};

export const getEvents = async (sportKey) => {
  const url = sportKey ? `/events?sport_key=${sportKey}` : '/events';
  const response = await api.get(url);
  return response.data.data.events;
};

export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data.data;
};