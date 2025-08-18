import { useState, useEffect, useCallback } from 'react';
import { getEventsBySport } from '../api/oddsApi';
import { getEvents } from '../api/sports';

export const useEvents = (sportKey, useOddsAPI = true) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definir la función afuera del useEffect y memoizarla con useCallback
  const fetchEvents = useCallback(async () => {
    if (!sportKey) return;

    try {
      setLoading(true);
      setError(null);

      let eventsData;

      if (useOddsAPI) {
        // Obtener desde Odds API
        eventsData = await getEventsBySport(sportKey);
      } else {
        // Obtener desde nuestra base de datos
        eventsData = await getEvents({ sport: sportKey });
      }

      setEvents(eventsData);
    } catch (err) {
      console.error('Error obteniendo eventos:', err);
      setError(err.message || 'Error al cargar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [sportKey, useOddsAPI]);

  // Ejecutar la primera vez que cambie sportKey o useOddsAPI
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Ahora refetch puede usar directamente fetchEvents
  const refetch = () => {
    fetchEvents();
  };

  return { events, loading, error, refetch };
};
