import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateIssueDTO, UpdateIssueDTO, IssueFilters } from '../types/index';

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

    // Filtros
    const where: any = {
      orgId: req.user!.organizationId,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Consulta con paginación
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

export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findFirst({
      where: {
        id,
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

    // Validaciones
    if (!title || title.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title is required',
      });
    }

    // Verificar assignee si existe
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

    // Crear actividad
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

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateIssueDTO = req.body;

    // Verificar que el issue existe y pertenece a la org
    const existingIssue = await prisma.issue.findFirst({
      where: {
        id,
        orgId: req.user!.organizationId,
      },
    });

    if (!existingIssue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    // Validar title si se actualiza
    if (updates.title !== undefined && updates.title.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title cannot be empty',
      });
    }

    // Verificar assignee si se actualiza
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

    // Actualizar issue
    const issue = await prisma.issue.update({
      where: { id },
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

    // Crear actividades para cambios
    const activities = [];
    for (const [field, newValue] of Object.entries(updates)) {
      const oldValue = (existingIssue as any)[field];
      if (oldValue !== newValue) {
        activities.push({
          issueId: issue.id,
          action: 'updated',
          field,
          oldValue: String(oldValue || ''),
          newValue: String(newValue || ''),
        });
      }
    }

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

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findFirst({
      where: {
        id,
        orgId: req.user!.organizationId,
      },
    });

    if (!issue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    await prisma.issue.delete({ where: { id } });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error deleting issue',
    });
  }
};