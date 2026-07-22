import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, refreshTokenSchema, createUserSchema } from '../validations/auth.validation';
import { sendSuccess } from '../utils/apiResponse';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await AuthService.login(validated.email, validated.password, ipAddress);
      return sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshToken(validated.refreshToken);
      return sendSuccess(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken, req.user?.userId);
      return sendSuccess(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createUserSchema.parse(req.body);
      const user = await AuthService.registerUser(validated, req.user?.userId);
      return sendSuccess(res, 'User created successfully', user, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getUserProfile(req.user!.userId);
      return sendSuccess(res, 'User profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }
}
