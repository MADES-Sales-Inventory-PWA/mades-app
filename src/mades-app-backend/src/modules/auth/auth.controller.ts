import { Request, Response } from "express";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { loginSchema } from "./auth.schema";
import { AuthService } from "./auth.service";
import { z } from "zod";

export class AuthController{
    constructor(
        private readonly authService = new AuthService()
    ){}
    
    async login(req: Request, res: Response) {
        try {
            const credentials = loginSchema.parse(req.body);
            const user = await this.authService.login(credentials.userName, credentials.password);

            if (!user) {
                return sendError(
                    res,
                    401,
                    ApiErrorCode.AUTHORIZATION_ERROR,
                    "Credenciales inválidas"
                );
            }

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return sendError(
                    res,
                    400,
                    ApiErrorCode.VALIDATION_ERROR,
                    error.issues[0]?.message ?? "Error de validación"
                );
            }

            return sendError(
                res,
                500,
                ApiErrorCode.INTERNAL_ERROR,
                error.message || "Error al iniciar sesión"
            );
        }
    }
}