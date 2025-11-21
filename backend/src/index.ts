import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsConfig } from './middleware/corsConfig';
import { jsonParseErrorHandler, globalErrorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimit';

import authRoutes from './routes/auth';
import issuesRoutes from './routes/issues';
import commentRoutes from './routes/comments';
import userRoutes from './routes/user';

/**
 * Punto de entrada principal del servidor Express
 * * Configura middlewares globales: CORS, parsers, rate limiting
 * * Define todas las rutas de la API
 * ! El puerto se obtiene de variables de entorno o usa 4000 por defecto
 */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// * Middlewares globales
app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(jsonParseErrorHandler);
app.use(generalLimiter);

// * Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/comments', commentRoutes);

// * Middleware de manejo de errores
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});