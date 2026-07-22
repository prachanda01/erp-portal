import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { createChallanSchema, updateChallanStatusSchema } from '../validations/challan.validation';
import { sendSuccess } from '../utils/apiResponse';

export class ChallanController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createChallanSchema.parse(req.body);
      const challan = await ChallanService.create(validated, req.user!.userId);
      return sendSuccess(res, 'Sales Challan created successfully', challan, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateChallanStatusSchema.parse(req.body);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await ChallanService.updateStatus(id, validated.status, req.user!.userId);
      return sendSuccess(res, `Sales Challan status updated to ${validated.status}`, updated);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ChallanService.getAll(req.query as any);
      return sendSuccess(res, 'Sales Challans retrieved successfully', result.challans, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const challan = await ChallanService.getById(id);
      return sendSuccess(res, 'Sales Challan details retrieved', challan);
    } catch (error) {
      next(error);
    }
  }
}
