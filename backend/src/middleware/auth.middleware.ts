import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole, UserTokenPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'scooby_super_secret_jwt_key_2026_tech_flow';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido ou inválido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token expirado ou inválido' });
    return;
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.cargo) && req.user.cargo !== 'ADMIN') {
      res.status(403).json({ 
        error: `Acesso negado: Perfil ${req.user.cargo} não possui permissão para esta ação.` 
      });
      return;
    }

    next();
  };
};
