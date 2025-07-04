import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user: { uid: string; name?: string; email?: string };
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = await auth.verifyIdToken(token);
    (req as AuthenticatedRequest).user = {
      uid: decoded.uid,
      name: decoded.name,
      email: decoded.email
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token invalide' });
  }
}
