import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: error.message,
    stack: env.nodeEnv === 'production' ? undefined : error.stack,
  });
};
