import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await DashboardService.getSummaryMetrics();
      return sendSuccess(res, 'Dashboard metrics retrieved', metrics);
    } catch (error) {
      next(error);
    }
  }
}
