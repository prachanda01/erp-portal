import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema, createFollowupSchema } from '../validations/customer.validation';
import { sendSuccess } from '../utils/apiResponse';

export class CustomerController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getAll(req.query as any);
      return sendSuccess(res, 'Customers retrieved successfully', result.customers, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await CustomerService.getById(id);
      return sendSuccess(res, 'Customer details retrieved', customer);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomerSchema.parse(req.body);
      const customer = await CustomerService.create(validated, req.user?.userId);
      return sendSuccess(res, 'Customer created successfully', customer, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateCustomerSchema.parse(req.body);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await CustomerService.update(id, validated, req.user?.userId);
      return sendSuccess(res, 'Customer updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await CustomerService.delete(id, req.user?.userId);
      return sendSuccess(res, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addFollowup(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createFollowupSchema.parse(req.body);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const followup = await CustomerService.addFollowup(id, validated, req.user!.userId);
      return sendSuccess(res, 'Customer follow-up note added', followup, undefined, 201);
    } catch (error) {
      next(error);
    }
  }
}
