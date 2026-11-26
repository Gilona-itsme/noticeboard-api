import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { prisma } from '../../prisma/client.ts';

export interface AuthUser {
  sub: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ message: 'Missing authorization header' });
    return;
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Expected authorization header: Bearer <token>' });
    return;
  }

  const { data, error } = verifyToken(token, 'access');
  if (error) {
    res.status(401).json({ message: error.message });
    return;
  }

  const userId = Number(data.sub);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });
  if (!user) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  req.user = { sub: user.id, username: user.username };
  next();
};

export default authenticate;