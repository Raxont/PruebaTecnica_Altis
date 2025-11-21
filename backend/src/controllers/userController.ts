import { Request, Response } from 'express';
import prisma from '../config/database';

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