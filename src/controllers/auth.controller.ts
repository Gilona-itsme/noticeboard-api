import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import  prisma  from '../../prisma/client.ts';
import { createTokens, verifyToken } from '../utils/jwt.ts';
import type { RegisterBody, LoginBody, RefreshBody } from '../validators/auth.validator.ts';

const SALT_ROUNDS = 10;

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
} as const;

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { username, email, password, name } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    res.status(409).json({ message: 'Username or email already taken' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { username, email, name, password: hashedPassword },
    select: publicUserSelect,
  });

  const tokens = createTokens(user.id);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id },
  });

  res.status(201).json({ user, ...tokens });
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  const isValid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !isValid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const tokens = createTokens(user.id);

  await prisma.refreshToken.upsert({
    where: { userId: user.id },
    update: { token: tokens.refreshToken },
    create: { token: tokens.refreshToken, userId: user.id },
  });

  res.status(200).json({
    user: { id: user.id, username: user.username, email: user.email, name: user.name },
    ...tokens,
  });
};

export const refresh = async (req: Request<{}, {}, RefreshBody>, res: Response) => {
  const { refreshToken: oldRefreshToken } = req.body;

  const { error } = verifyToken(oldRefreshToken, 'refresh');
  if (error) {
    res.status(401).json({ message: 'Refresh token invalid or expired' });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });
  if (!stored) {
    res.status(401).json({ message: 'Invalid refresh token' });
    return;
  }

  const tokens = createTokens(stored.userId);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: stored.userId } }),
  ]);

  res.status(200).json(tokens);
};

export const logout = async (req: Request, res: Response) => {
  await prisma.refreshToken.deleteMany({ where: { userId: req.user!.sub } });
  res.status(204).end();
};

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { ...publicUserSelect, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json(user);
};