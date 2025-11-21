import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateCommentDTO, UpdateCommentDTO } from '../types/index';

/**
 * Obtiene todos los comentarios de un issue específico
 * @param {Request} req - Solicitud HTTP con issueId en params
 * @param {Response} res - Respuesta HTTP con lista de comentarios
 * @returns {Promise<void>}
 * ! Verifica que el issue pertenezca a la organización del usuario
 */
export const getCommentsByIssue = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;

    // ? Verificar que el issue existe y pertenece a la organización
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

    // * Obtener comentarios ordenados por fecha (más recientes primero)
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

/**
 * Crea un nuevo comentario en un issue
 * @param {Request} req - Solicitud HTTP con content e issueId
 * @param {Response} res - Respuesta HTTP con el comentario creado
 * @returns {Promise<void>}
 * ! Valida que el contenido no esté vacío y el issue exista
 * ? Crea automáticamente una actividad registrando el comentario
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, issueId }: CreateCommentDTO = req.body;

    // * Validación de contenido requerido
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

    // ? Verificar que el issue exista y pertenezca a la organización
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

    // * Crear comentario
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

    // * Obtener nombre del usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    // * Crear preview del comentario para la actividad
    const commentPreview = content.length > 50
      ? content.substring(0, 50) + '...'
      : content;

    // * Registrar actividad del comentario
    await prisma.activity.create({
      data: {
        issueId,
        action: 'added comment',
        field: currentUser?.name || 'Unknown',
        newValue: commentPreview,
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

/**
 * Actualiza un comentario existente
 * @param {Request} req - Solicitud HTTP con ID del comentario y nuevo contenido
 * @param {Response} res - Respuesta HTTP con el comentario actualizado
 * @returns {Promise<void>}
 * ! Solo el autor del comentario puede editarlo
 */
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content }: UpdateCommentDTO = req.body;

    // * Validación de contenido
    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content is required',
      });
    }

    // ? Verificar que el comentario existe
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

    // ! Verificar que el usuario es el autor
    if (existingComment.authorId !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own comments',
      });
    }

    // ? Verificar que el issue pertenece a la organización
    if (existingComment.issue.orgId !== req.user!.organizationId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    // * Actualizar comentario
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

/**
 * Elimina un comentario del sistema
 * @param {Request} req - Solicitud HTTP con ID del comentario
 * @param {Response} res - Respuesta HTTP confirmando la eliminación
 * @returns {Promise<void>}
 * ! Solo el autor del comentario puede eliminarlo
 * ? Registra la eliminación en las actividades del issue
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ? Verificar que el comentario existe
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

    // ! Verificar que el usuario es el autor
    if (existingComment.authorId !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own comments',
      });
    }

    // ? Verificar que el issue pertenece a la organización
    if (existingComment.issue.orgId !== req.user!.organizationId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    // * Obtener información del autor antes de eliminar
    const author = await prisma.user.findUnique({
      where: { id: existingComment.authorId },
      select: { name: true },
    });

    // * Eliminar comentario
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    // * Crear preview del comentario eliminado
    const commentPreview = existingComment.content.length > 50
      ? existingComment.content.substring(0, 50) + '...'
      : existingComment.content;

    // * Registrar actividad de eliminación
    await prisma.activity.create({
      data: {
        issueId: existingComment.issueId,
        action: 'deleted comment',
        field: author?.name || 'Unknown',
        oldValue: commentPreview,
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