import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const formatError = (error: z.ZodError) => {
  const { fieldErrors, formErrors } = z.flattenError(error);
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : formErrors;
};

export const validateBody =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Validation failed', details: formatError(result.error) });
      return;
    }
    req.body = result.data;
    next();
  };

export const validateParams =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid parameters', details: formatError(result.error) });
      return;
    }
    res.locals.params = result.data;
    next();
  };

export const validateQuery =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid query parameters', details: formatError(result.error) });
      return;
    }
    res.locals.query = result.data;
    next();
  };