import rateLimit from 'express-rate-limit';

/**
 * Rate limiter específico para rutas de autenticación
 * * Límite: 5 intentos cada 15 minutos por IP
 * ! Previene ataques de fuerza bruta en login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter general para todas las rutas de la API
 * * Límite: 100 solicitudes cada 15 minutos por IP
 * ? Protección básica contra DDoS y abuso de la API
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 solicitudes
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});