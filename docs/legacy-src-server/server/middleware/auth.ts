import express from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.LOGWEB_JWT_SECRET || 'track_daily_dev_secret_key';

export interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'admin';
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or invalid' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'student' | 'admin';
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is invalid or expired' });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Requires Administrator role access' });
    return;
  }
  next();
}
