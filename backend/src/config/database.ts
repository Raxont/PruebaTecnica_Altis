import { PrismaClient } from '@prisma/client';

/**
 * Cliente de Prisma para interactuar con la base de datos PostgreSQL
 * * Instancia única compartida en toda la aplicación
 * ! Asegúrate de que DATABASE_URL esté configurado en .env
 */
const prisma = new PrismaClient();

export default prisma;