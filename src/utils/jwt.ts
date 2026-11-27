import jwt, { type JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

export type TokenType = 'access' | 'refresh';

export interface TokenPayload extends JwtPayload {
  sub: string;
  type: TokenType;
}

export const createAccessToken = (userId: number) =>
  jwt.sign({ sub: String(userId), type: 'access' }, JWT_SECRET, { expiresIn: '15m' });

export const createRefreshToken = (userId: number) =>
  jwt.sign(
    { sub: String(userId), type: 'refresh', jti: randomUUID() },
    JWT_SECRET,
    { expiresIn: '7d' },
  );


type VerifyResult =
  | { data: TokenPayload; error: null }
  | { data: null; error: Error };

export const verifyToken = (token: string, expectedType: TokenType = 'access'): VerifyResult => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === 'string' || !payload.sub) {
      throw new Error('Token payload must contain sub');
    }
    if (payload.type !== expectedType) {
      throw new Error('Invalid token type');
    }

    return { data: payload as TokenPayload, error: null };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { data: null, error: new Error('Token expired') };
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Invalid token'),
    };
  }
};