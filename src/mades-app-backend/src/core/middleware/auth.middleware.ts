import { Request, Response, NextFunction } from "express";
import TokenService from "../services/token.service";
import { TokenPayload, isTokenPayload } from "../../shared/models/auth/token-payload.model";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { sendError } from "../utils/api-error-handler";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  const { token, error } = extractToken(req);

  if (error) {
    return sendError(res, 401, ApiErrorCode.INVALID_TOKEN, error);
  }

  try {
    const decoded = TokenService.verifyToken(token!);

    if (!isTokenPayload(decoded)) {
      return sendError(
        res,
        401,
        ApiErrorCode.INVALID_TOKEN,
        "El token no contiene un payload válido"
      );
    }

    req.user = decoded;

    next();

  } catch {
    return sendError(
      res,
      401,
      ApiErrorCode.INVALID_TOKEN,
      "El token de autenticación es inválido o ha expirado"
    );
  }
}

function extractToken(req: Request): { token?: string; error?: string } {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { error: "No se proporcionó el token de autenticación" };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return { error: "El formato del token de autenticación es inválido" };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return { error: "El token de autenticación está vacío" };
  }

  return { token };
}