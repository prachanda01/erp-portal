import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};
