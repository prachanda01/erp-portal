import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';
import { sendSuccess } from '../utils/apiResponse';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const lowStockOnly = req.query.lowStock === 'true';
      const result = await ProductService.getAll({ ...req.query, lowStockOnly } as any);
      return sendSuccess(res, 'Products retrieved successfully', result.products, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await ProductService.getById(id);
      return sendSuccess(res, 'Product details retrieved', product);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await ProductService.create(validated, req.user?.userId);
      return sendSuccess(res, 'Product created successfully', product, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProductSchema.parse(req.body);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await ProductService.update(id, validated, req.user?.userId);
      return sendSuccess(res, 'Product updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ProductService.delete(id, req.user?.userId);
      return sendSuccess(res, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories();
      return sendSuccess(res, 'Product categories retrieved', categories);
    } catch (error) {
      next(error);
    }
  }
}
