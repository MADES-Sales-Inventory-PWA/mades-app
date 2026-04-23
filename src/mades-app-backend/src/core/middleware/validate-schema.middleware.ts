import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendError } from "../utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";

type RequestPart = "body" | "params" | "query";

declare global {
    namespace Express {
        interface Request {
            validatedQuery?: Record<string, unknown>;
        }
    }
}

export function validateMiddleware(schema: z.ZodType, part: RequestPart = "body") {
    return function (req: Request, res: Response, next: NextFunction) {
        const parsed = schema.safeParse(req[part]);

        if (!parsed.success) {
            const message = parsed.error.issues.map(i => i.message).join(", ");
            return sendError(res, 400, ApiErrorCode.VALIDATION_ERROR, message);
        }

        if (part === "query") {
            req.validatedQuery = parsed.data as Record<string, unknown>;
        } else {
            req[part] = parsed.data;
        }

        next();
    };
}