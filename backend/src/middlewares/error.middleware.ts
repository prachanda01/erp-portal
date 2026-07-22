import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error processing request ${req.method} ${req.url}:`, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation error', 400, formattedErrors);
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return sendError(res, err.message || 'Unauthorized access', 401);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};
