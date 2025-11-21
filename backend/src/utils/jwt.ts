import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * Genera un token JWT con los datos del usuario
 * @param {Object} payload - Datos del usuario (id, email, organizationId)
 * @returns {string} Token JWT firmado con expiración de 7 días
 */
export const generateToken = (payload: {
  id: number;
  email: string;
  organizationId: number;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado del token
 * ! Lanza error si el token es inválido o expirado
 */
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};