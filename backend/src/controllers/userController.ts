import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Obtiene todos los usuarios de la organización del usuario autenticado
 * @param {Request} req - Solicitud HTTP con datos del usuario autenticado
 * @param {Response} res - Respuesta HTTP con lista de usuarios de la organización
 * @returns {Promise<void>}
 * ! Solo retorna usuarios de la misma organización
 * ? Ordena usuarios alfabéticamente por nombre
 */
export const getUsersByOrganization = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        organizationId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error fetching users',
    });
  }
};