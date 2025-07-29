// Estados de apuestas
export const BET_STATUS = {
  PENDING: 'pending',
  WON: 'won',
  LOST: 'lost',
  CANCELED: 'canceled'
};

// Estados de depósitos y retiros
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

// Métodos de pago
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_PAYMENT: 'mobile_payment',
  BINANCE: 'binance'
};

// Tipos de mercado
export const MARKET_TYPES = {
  H2H: 'h2h',
  SPREAD: 'spread',
  TOTALS: 'totals',
  OUTRIGHTS: 'outrights'
};

// Roles de usuario
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Grupos de deportes
export const SPORT_GROUPS = {
  BASEBALL: 'Baseball',
  BASKETBALL: 'Basketball',
  SOCCER: 'Soccer',
  ICE_HOCKEY: 'Ice Hockey',
  AMERICAN_FOOTBALL: 'American Football'
};

// Países disponibles
export const COUNTRIES = [
  'Venezuela',
  'Colombia',
  'México',
  'Argentina',
  'Chile',
  'Perú',
  'Ecuador',
  'Uruguay',
  'Paraguay',
  'Bolivia',
  'Brasil',
  'República Dominicana',
  'Panamá',
  'Costa Rica'
];

// Límites de transacciones
export const TRANSACTION_LIMITS = {
  MIN_DEPOSIT: 1,
  MAX_DEPOSIT: 50000,
  MIN_WITHDRAWAL: 1,
  MAX_WITHDRAWAL: 50000,
  MIN_BET: 1,
  MAX_BET: 10000
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  SERVER_ERROR: 'Error interno del servidor. Inténtalo más tarde.'
};

// Configuración de tema
export const THEME_CONFIG = {
  DRAWER_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 200
};