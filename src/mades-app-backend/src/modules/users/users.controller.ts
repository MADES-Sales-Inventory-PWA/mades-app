import { Request, Response } from "express";
import { UserService } from "./users.service"
import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./users.schema";

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

    async createFirstAdmin(req: Request, res: Response) {
        try {
            const userData = createUserSchema.parse(req.body);
            await this.userService.createFirstAdmin(userData);
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
    async updateUser(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);
            const validatedData = updateUserSchema.parse(req.body);
            await this.userService.updateUser(userId, validatedData);

            res.status(200).json({
                success: true,
                message: "Datos actualizados correctamente",
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: error.issues[0]?.message ?? "Error de validación"
                });
            }
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}