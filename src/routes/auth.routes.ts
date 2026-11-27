import { Router } from 'express';
import { validateBody } from '../middleware/validate.ts';
import authenticate from '../middleware/authenticate.ts';
import { registerSchema, loginSchema, refreshSchema, authResponseSchema, tokensSchema, meResponseSchema } from '../validators/auth.validator.ts';
import { register, login, refresh, logout, me } from '../controllers/auth.controller.ts';
import { errorSchema } from '../validators/common.validator.ts';
import { registry, bearerAuth, jsonContent } from '../openapi.ts';

const router = Router();
const security = [{ [bearerAuth.name]: [] }];


router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshSchema), refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'New user registration',
  request: { body: { content: jsonContent(registerSchema) } },
  responses: {
    201: { description: 'User created', content: jsonContent(authResponseSchema) },
    400: { description: 'Validation error', content: jsonContent(errorSchema) },
    409: { description: 'Username or email already taken', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login',
  request: { body: { content: jsonContent(loginSchema) } },
  responses: {
    200: { description: 'Successful login', content: jsonContent(authResponseSchema) },
    401: { description: 'Invalid credentials', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Token rotation',
  request: { body: { content: jsonContent(refreshSchema) } },
  responses: {
    200: { description: 'New token pair', content: jsonContent(tokensSchema) },
    401: { description: 'Invalid refresh token', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Logout',
  security,
  responses: {
    204: { description: 'Refresh token invalidated' },
    401: { description: 'Not authenticated', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Current user profile',
  security,
  responses: {
    200: { description: 'Profile', content: jsonContent(meResponseSchema) },
    401: { description: 'Not authenticated', content: jsonContent(errorSchema) },
  },
});

export default router;