import api from './index';

export const getSports = async () => {
  const response = await api.get('/sports');
  return response.data.data;
};

export const getEvents = async (sportKey) => {
  const url = sportKey ? `/events?sport_key=${sportKey}` : '/events';
  console.log('Fetching events from URL:', url);
  const response = await api.get(url);
  return response.data.data.events;
};

export const getEvent = async (eventId) => {
  const url = `/events/${eventId}`;
  console.log('Fetching event from URL:', url);
  const response = await api.get(url);
  return response.data.data;
};