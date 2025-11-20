import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsConfig } from './middleware/corsConfig.js';
import { jsonParseErrorHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(jsonParseErrorHandler);
app.use(generalLimiter);

// Rutas (próximamente)
// app.use('/api/auth', authRoutes);
// app.use('/api/issues', authenticateToken, issuesRoutes);
// app.use('/api/comments', authenticateToken, commentsRoutes);

// Error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});