import { Response } from "express";
import { ErrorResponseSchema } from "../../shared/models/api/error-response.schema";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";

export function sendError(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string
) {

  const errorResponse = ErrorResponseSchema.parse({
    code,
    message
  });

  return res.status(status).json(errorResponse);
}