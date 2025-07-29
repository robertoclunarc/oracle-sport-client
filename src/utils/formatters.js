import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear moneda
export const formatCurrency = (amount, currency = 'USDT') => {
  const numAmount = parseFloat(amount || 0);
  return `${numAmount.toFixed(2)} ${currency}`;
};

// Formatear cuotas americanas
export const formatOdds = (price) => {
  const odds = parseFloat(price);
  return odds >= 0 ? `+${odds}` : odds.toString();
};

// Formatear cuotas decimales
export const formatDecimalOdds = (price) => {
  return parseFloat(price).toFixed(2);
};

// Formatear fecha
export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  return format(new Date(date), pattern, { locale: es });
};

// Formatear fecha y hora
export const formatDateTime = (date, pattern = 'dd/MM/yyyy HH:mm') => {
  return format(new Date(date), pattern, { locale: es });
};

// Formatear tiempo relativo
export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true, 
    locale: es 
  });
};

// Formatear número con separadores de miles
export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num);
};

// Formatear porcentaje
export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Capitalizar primera letra
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};