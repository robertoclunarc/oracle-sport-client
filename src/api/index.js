import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://oracle-sport-backend.vercel.app/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de token expirado (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Manejar errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      error.message = 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    return Promise.reject(error);
  }
);

export default api;