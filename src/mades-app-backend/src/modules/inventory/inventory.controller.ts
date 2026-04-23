import { Response } from "express";
import { z } from "zod";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { AuthRequest } from "../../core/middleware/auth.middleware";
import { createInventoryAdjustmentSchema } from "./inventory.schema";
import { InventoryService } from "./inventory.service";

export class InventoryController {
  constructor(private readonly service = new InventoryService()) {}

  async registerAdjustment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(
          res,
          401,
          ApiErrorCode.INVALID_TOKEN,
          "No hay usuario autenticado"
        );
      }

      const data = createInventoryAdjustmentSchema.parse(req.body);

      const adjustment = await this.service.registerAdjustment(
        req.user.userId,
        data
      );

      return res.status(201).json({
        success: true,
        message: "Ajuste registrado",
        data: adjustment,
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
        const message = error.message;

        if (
          message.includes("no coincide") ||
          message.includes("No se encontro") ||
          message.includes("Stock insuficiente")
        ) {
          return sendError(res, 400, ApiErrorCode.VALIDATION_ERROR, message);
        }

        return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, message);
      }

      return sendError(
        res,
        500,
        ApiErrorCode.INTERNAL_ERROR,
        "Error desconocido al registrar ajuste"
      );
    }
  }

  async listAdjustments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(
          res,
          401,
          ApiErrorCode.INVALID_TOKEN,
          "No hay usuario autenticado"
        );
      }

      const productId = req.query.productId
        ? Number(req.query.productId)
        : undefined;
      const type = req.query.type as string | undefined;
      const reason = req.query.reason as string | undefined;
      const from = req.query.from
        ? new Date(req.query.from as string)
        : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.max(1, Number(req.query.pageSize) || 20);

      const result = await this.service.listAdjustments({
        productId,
        type: type as "LOSS" | "GAIN" | undefined,
        reason,
        from,
        to,
        page,
        pageSize,
      });

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
      if (error instanceof Error) {
        return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, error.message);
      }
      return sendError(
        res,
        500,
        ApiErrorCode.INTERNAL_ERROR,
        "Error desconocido al listar ajustes"
      );
    }
  }

  async getAdjustmentById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(
          res,
          401,
          ApiErrorCode.INVALID_TOKEN,
          "No hay usuario autenticado"
        );
      }

      const adjustmentId = Number(req.params.id);

      if (!Number.isInteger(adjustmentId) || adjustmentId <= 0) {
        return sendError(
          res,
          400,
          ApiErrorCode.VALIDATION_ERROR,
          "El id del ajuste no es valido"
        );
      }

      const adjustment = await this.service.getAdjustmentById(adjustmentId);

      if (!adjustment) {
        return sendError(
          res,
          404,
          ApiErrorCode.RESOURCE_NOT_FOUND,
          "Ajuste no encontrado"
        );
      }

      return res.status(200).json({
        success: true,
        data: adjustment,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, error.message);
      }
      return sendError(
        res,
        500,
        ApiErrorCode.INTERNAL_ERROR,
        "Error desconocido al obtener ajuste"
      );
    }
  }
}
