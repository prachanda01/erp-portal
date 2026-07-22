import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { stockAdjustmentSchema } from '../validations/inventory.validation';
import { sendSuccess } from '../utils/apiResponse';

export class InventoryController {
  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = stockAdjustmentSchema.parse(req.body);
      const result = await InventoryService.adjustStock(
        validated.productId,
        validated.warehouseId,
        validated.quantity,
        validated.movementType,
        validated.reason,
        req.user!.userId
      );
      return sendSuccess(res, 'Stock adjustment completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InventoryService.getMovements(req.query);
      return sendSuccess(res, 'Stock movements retrieved successfully', result.movements, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouses = await InventoryService.getWarehouses();
      return sendSuccess(res, 'Warehouses retrieved successfully', warehouses);
    } catch (error) {
      next(error);
    }
  }
}
