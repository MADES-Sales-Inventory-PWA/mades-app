import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../core/middleware/auth.middleware";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { reportFiltersSchema } from "./reports.schema";
import { ReportsService } from "./reports.service";

export class ReportsController {
  constructor(private readonly service = new ReportsService()) {}

  async getSalesHistory(req: AuthRequest, res: Response) {
    try {
      const filters = reportFiltersSchema.parse(req.query);
      const result = await this.service.getSalesHistory(filters);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
        },
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          400,
          ApiErrorCode.VALIDATION_ERROR,
          error.issues[0]?.message ?? "Error de validacion"
        );
      }

      if (error instanceof Error) {
        return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, error.message);
      }

      return sendError(
        res,
        500,
        ApiErrorCode.INTERNAL_ERROR,
        "Error desconocido al obtener el historial de ventas"
      );
    }
  }

  async getInventoryAdjustments(req: AuthRequest, res: Response) {
    try {
      const filters = reportFiltersSchema.parse(req.query);
      const result = await this.service.getInventoryAdjustments(filters);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
        },
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          400,
          ApiErrorCode.VALIDATION_ERROR,
          error.issues[0]?.message ?? "Error de validacion"
        );
      }

      if (error instanceof Error) {
        return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, error.message);
      }

      return sendError(
        res,
        500,
        ApiErrorCode.INTERNAL_ERROR,
        "Error desconocido al obtener los movimientos de inventario"
      );
    }
  }
}