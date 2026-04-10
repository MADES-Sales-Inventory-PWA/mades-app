import { Request, Response } from "express";
import { UserService } from "./users.service"
import { z } from "zod";
import { createUserSchema, loginSchema } from "./users.schema";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";

export class UserController {
    private userService = new UserService();

    async getAdminExists(req: Request, res: Response) {
        try {
            const exists = await this.userService.adminExists();
            return res.status(200).json({
                success: true,
                data: { exists }
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error al validar administrador"
            });
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const userData = createUserSchema.parse(req.body);
            await this.userService.createUser(userData);
            res.status(201).json({
                message: "Usuario creado exitosamente"
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: error.issues[0]?.message ?? "Error de validación"
                });
            }
            return res.status(400).json({
                success: false,
                message: error.message || "Error al crear el usuario"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const credentials = loginSchema.parse(req.body);
            const user = await this.userService.login(credentials.userName, credentials.password);

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