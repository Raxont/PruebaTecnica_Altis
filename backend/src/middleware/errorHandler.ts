import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para manejar errores de sintaxis JSON
 * @param {any} err - Error capturado
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {void}
 * ! Intercepta errores de JSON malformado y retorna 400
 */
export const jsonParseErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON format',
    });
  }
  next();
};

/**
 * Middleware global para manejo de errores
 * @param {any} err - Error capturado
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {void}
 * ? Maneja cualquier error no capturado en la aplicación
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
};