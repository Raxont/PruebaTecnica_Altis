import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { RegisterDTO, LoginDTO } from '../types/index';

/**
 * Registra un nuevo usuario en el sistema
 * @param {Request} req - Solicitud HTTP con datos del usuario (email, password, name, organizationId)
 * @param {Response} res - Respuesta HTTP con el usuario creado y token JWT
 * @returns {Promise<void>}
 * ! Valida que el email no esté registrado y que la organización exista
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, organizationId }: RegisterDTO = req.body;

    // * Validaciones de campos requeridos
    if (!email || !password || !name || !organizationId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'All fields are required',
      });
    }

    // ? Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email already registered',
      });
    }

    // ? Verificar que la organización existe
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Organization not found',
      });
    }

    // * Hash del password con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // * Crear usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
      },
    });

    // * Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    // * Establecer cookie httpOnly con el token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error creating user',
    });
  }
};

/**
 * Inicia sesión de un usuario existente
 * @param {Request} req - Solicitud HTTP con credenciales (email, password)
 * @param {Response} res - Respuesta HTTP con datos del usuario y token JWT
 * @returns {Promise<void>}
 * ! Valida credenciales antes de generar el token
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDTO = req.body;

    // * Validaciones de campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    // ? Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // * Verificar password con bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // * Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    // * Establecer cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error logging in',
    });
  }
};

/**
 * Cierra la sesión del usuario eliminando la cookie
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {void}
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

/**
 * Obtiene los datos del usuario autenticado actual
 * @param {Request} req - Solicitud HTTP con datos del usuario en req.user
 * @param {Response} res - Respuesta HTTP con datos del usuario
 * @returns {Promise<void>}
 * ! Requiere que el usuario esté autenticado (middleware)
 */
export const me = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error fetching user',
    });
  }
};