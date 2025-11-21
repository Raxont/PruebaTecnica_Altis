import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateIssueDTO, UpdateIssueDTO, IssueFilters } from '../types/index';

/**
 * Obtiene una lista paginada de issues con filtros opcionales
 * @param {Request} req - Solicitud HTTP con query params (status, priority, assigneeId, search, page, limit)
 * @param {Response} res - Respuesta HTTP con issues y datos de paginación
 * @returns {Promise<void>}
 * ! Solo retorna issues de la organización del usuario autenticado
 * ? Soporta filtros combinables y búsqueda por texto
 */
export const getIssues = async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      assigneeId,
      search,
      page = '1',
      limit = '10',
    } = req.query as any;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // * Construcción dinámica de filtros
    const where: any = {
      orgId: req.user!.organizationId,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = parseInt(assigneeId);

    // * Búsqueda por texto en título o descripción
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // * Consulta paginada con conteo total
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      issues,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error fetching issues',
    });
  }
};

/**
 * Obtiene el detalle completo de un issue específico
 * @param {Request} req - Solicitud HTTP con el ID del issue en params
 * @param {Response} res - Respuesta HTTP con datos del issue, comentarios y actividades
 * @returns {Promise<void>}
 * ! Verifica que el issue pertenezca a la organización del usuario
 */
export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findFirst({
      where: {
        id: parseInt(id), // ← Convertir a número
        orgId: req.user!.organizationId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!issue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error fetching issue',
    });
  }
};

/**
 * Crea un nuevo issue en el sistema
 * @param {Request} req - Solicitud HTTP con datos del issue (title, description, status, priority, assigneeId, labels)
 * @param {Response} res - Respuesta HTTP con el issue creado
 * @returns {Promise<void>}
 * ! Valida que el título no esté vacío y que el assignee pertenezca a la organización
 * ? Crea automáticamente una actividad de creación
 */
export const createIssue = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status = 'TODO',
      priority = 'MED',
      assigneeId,
      labels = [],
    }: CreateIssueDTO = req.body;

    // * Validación de título requerido
    if (!title || title.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title is required',
      });
    }

    // ? Verificar que el assignee exista y pertenezca a la organización
    if (assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: assigneeId,
          organizationId: req.user!.organizationId,
        },
      });

      if (!assignee) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Assignee not found in organization',
        });
      }
    }

    // * Crear issue en la base de datos
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status,
        priority,
        assigneeId,
        labels,
        creatorId: req.user!.id,
        orgId: req.user!.organizationId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // * Registrar actividad de creación
    await prisma.activity.create({
      data: {
        issueId: issue.id,
        action: 'created',
        field: 'issue',
        newValue: 'Issue created',
      },
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error creating issue',
    });
  }
};

/**
 * Actualiza un issue existente
 * @param {Request} req - Solicitud HTTP con ID del issue y datos a actualizar
 * @param {Response} res - Respuesta HTTP con el issue actualizado
 * @returns {Promise<void>}
 * ! Verifica que el issue pertenezca a la organización del usuario
 * ? Crea actividades automáticas para cada campo modificado
 */
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateIssueDTO = req.body;

    // ? Verificar que el issue exista y pertenezca a la organización
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id: parseInt(id),
        orgId: req.user!.organizationId,
      },
    });

    if (!existingIssue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    // * Validar title si se actualiza
    if (updates.title !== undefined && updates.title.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title cannot be empty',
      });
    }

    // ? Verificar assignee si se actualiza
    if (updates.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: updates.assigneeId,
          organizationId: req.user!.organizationId,
        },
      });

      if (!assignee) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Assignee not found in organization',
        });
      }
    }

    // * Actualizar issue
    const issue = await prisma.issue.update({
      where: { id: parseInt(id) },
      data: updates,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // * Crear actividades para cada campo modificado
    const activities = [];
    for (const [field, newValue] of Object.entries(updates)) {
      const oldValue = (existingIssue as any)[field];
      
      // * Manejo especial para assigneeId - mostrar nombres en lugar de IDs
      if (field === 'assigneeId') {
        if (oldValue !== newValue) {
          let oldName = 'Unassigned';
          let newName = 'Unassigned';
          
          if (oldValue) {
            const oldUser = await prisma.user.findUnique({
              where: { id: oldValue },
              select: { name: true },
            });
            oldName = oldUser?.name || 'Unknown';
          }
          
          if (newValue) {
            const newUser = await prisma.user.findUnique({
              where: { id: newValue as number },
              select: { name: true },
            });
            newName = newUser?.name || 'Unknown';
          }
          
          activities.push({
            issueId: issue.id,
            action: 'updated',
            field: 'assignee',
            oldValue: oldName,
            newValue: newName,
          });
        }
      }

      // * Manejo especial para arrays (labels)
      else if (field === 'labels') {
        const oldLabels = Array.isArray(oldValue) ? oldValue.sort().join(',') : '';
        const newLabels = Array.isArray(newValue) ? newValue.sort().join(',') : '';
        if (oldLabels !== newLabels) {
          activities.push({
            issueId: issue.id,
            action: 'updated',
            field,
            oldValue: oldLabels,
            newValue: newLabels,
          });
        }
      }

      // * Comparación para valores normales
      else {
        const normalizedOld = oldValue === null || oldValue === undefined ? '' : String(oldValue);
        const normalizedNew = newValue === null || newValue === undefined ? '' : String(newValue);
        
        if (normalizedOld !== normalizedNew) {
          activities.push({
            issueId: issue.id,
            action: 'updated',
            field,
            oldValue: normalizedOld,
            newValue: normalizedNew,
          });
        }
      }
    }

    // * Guardar actividades en batch
    if (activities.length > 0) {
      await prisma.activity.createMany({ data: activities });
    }

    res.json(issue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error updating issue',
    });
  }
};

/**
 * Elimina un issue del sistema
 * @param {Request} req - Solicitud HTTP con el ID del issue a eliminar
 * @param {Response} res - Respuesta HTTP confirmando la eliminación
 * @returns {Promise<void>}
 * ! Elimina en cascada todos los comentarios y actividades relacionados
 */
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ? Verificar que el issue exista y pertenezca a la organización
    const issue = await prisma.issue.findFirst({
      where: {
        id: parseInt(id),
        orgId: req.user!.organizationId,
      },
    });

    if (!issue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    // * Eliminar issue (cascada automática en Prisma)
    await prisma.issue.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error deleting issue',
    });
  }
};