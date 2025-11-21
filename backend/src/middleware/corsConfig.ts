import cors from 'cors';

/**
 * Configuración de CORS para permitir peticiones desde el frontend
 * * Permite credenciales (cookies) y métodos HTTP estándar
 * ! La URL del frontend se obtiene de variables de entorno
 */
export const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});