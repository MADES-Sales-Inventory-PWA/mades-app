import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { sendError } from "../utils/api-error-handler";

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 401, ApiErrorCode.INVALID_TOKEN, "No hay usuario autenticado");
  }

  if (Number(req.user.roleId) !== 1) {
    return sendError(
      res,
      403,
      ApiErrorCode.AUTHORIZATION_ERROR,
      "No tienes permisos para acceder a este recurso"
    );
  }

  next();
}