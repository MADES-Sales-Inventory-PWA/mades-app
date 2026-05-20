import { Response } from "express";
import { z } from "zod";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { AuthRequest } from "../../core/middleware/auth.middleware";
import { createSaleSchema } from "./sales.schema";
import { SalesService } from "./sales.service";

export class SalesController {
  constructor(private readonly service = new SalesService()) {}

  async registerSale(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, ApiErrorCode.INVALID_TOKEN, "No hay usuario autenticado");
      }

      const data = createSaleSchema.parse(req.body);
      const sale = await this.service.registerSale(req.user.userId, data);

      return res.status(201).json({
        success: true,
        message: "Venta registrada",
        data: sale,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          400,
          ApiErrorCode.VALIDATION_ERROR,
          error.issues[0]?.message ?? "Error de validación"
        );
      }

      if (error instanceof Error) {
        const message = error.message;

        if (
          message.includes("Stock insuficiente") ||
          message.includes("No se encontró") ||
          message.includes("no está activo")
        ) {
          return sendError(res, 400, ApiErrorCode.VALIDATION_ERROR, message);
        }

        return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, message);
      }

      return sendError(
        res,
        500,
        ApiErrorCode.INTERNAL_ERROR,
        "Error desconocido al registrar venta"
      );
    }
  }
}