import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * * Interfaz para el payload del token JWT
 */
interface JWTPayload {
  id: number;
  email: string;
  organizationId: number;
}

/**
 * * Extensión del tipo Request de Express para incluir datos del usuario
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para autenticar y validar el token JWT
 * @param {Request} req - Solicitud HTTP con cookie de token
 * @param {Response} res - Respuesta HTTP
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {void}
 * ! Verifica que el token exista y sea válido
 * ? Si el token es inválido, limpia la cookie y retorna 401
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // * Extraer token de las cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }

  try {

    // * Verificar y decodificar el token JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;

    // * Agregar datos del usuario a la solicitud
    req.user = decoded;
    next();
  } catch (error) {
    
    // ! Token inválido o expirado - limpiar cookie
    res.clearCookie('token');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};