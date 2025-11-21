import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateCommentDTO, UpdateCommentDTO } from '../types/index';

export const getCommentsByIssue = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;

    // Verificar que el issue existe y pertenece a la org
    const issue = await prisma.issue.findFirst({
      where: {
        id: parseInt(issueId),
        orgId: req.user!.organizationId,
      },
    });

    if (!issue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    const comments = await prisma.comment.findMany({
      where: { issueId: parseInt(issueId) },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error fetching comments',
    });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, issueId }: CreateCommentDTO = req.body;

    // Validaciones
    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content is required',
      });
    }

    if (!issueId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Issue ID is required',
      });
    }

    // Verificar que el issue existe y pertenece a la org
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        orgId: req.user!.organizationId,
      },
    });

    if (!issue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        issueId,
        authorId: req.user!.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Crear actividad
    await prisma.activity.create({
      data: {
        issueId,
        action: 'added comment',
        field: null,
        newValue: null,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error creating comment',
    });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content }: UpdateCommentDTO = req.body;

    // Validaciones
    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content is required',
      });
    }

    // Verificar que el comentario existe
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { issue: true },
    });

    if (!existingComment) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Comment not found',
      });
    }

    // Verificar que el usuario es el autor
    if (existingComment.authorId !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own comments',
      });
    }

    // Verificar que el issue pertenece a la org
    if (existingComment.issue.orgId !== req.user!.organizationId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error updating comment',
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el comentario existe
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { issue: true },
    });

    if (!existingComment) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Comment not found',
      });
    }

    // Verificar que el usuario es el autor
    if (existingComment.authorId !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own comments',
      });
    }

    // Verificar que el issue pertenece a la org
    if (existingComment.issue.orgId !== req.user!.organizationId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    // Crear actividad de eliminación
    await prisma.activity.create({
      data: {
        issueId: existingComment.issueId,
        action: 'deleted comment',
        field: null,
        newValue: null,
      },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error deleting comment',
    });
  }
};