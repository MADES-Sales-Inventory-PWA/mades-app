import { Request, Response } from "express";
import { UserService } from "./users.service"
import { z } from "zod";
import { createUserSchema, updateUserSchema, UserFilters } from "./users.schema";

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
            const user = await this.userService.createUser(userData);
            res.status(201).json({
                success: true,
                message: "Usuario creado exitosamente",
                data: user
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
            const user = await this.userService.updateUser(userId, validatedData);

            res.status(200).json({
                success: true,
                message: "Usuario actualizado correctamente",
                data: user
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
    async findAll(req: Request, res: Response) {
        try {
            const filters: UserFilters = {
                id: req.query.id ? Number(req.query.id) : undefined,
                email: req.query.email as string,
                docNumber: req.query.docNumber as string,
                rolId: req.query.rolId ? Number(req.query.rolId) : undefined
            };
            const users = await this.userService.getAll(filters);
            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async changeStatus(req: Request, res: Response) {
    try {
        const userId = Number(req.params.id);
        const { state } = req.body; 

        await this.userService.changeStatus(userId, state);

        res.status(200).json({
            success: true,
            message: state ? "Usuario activado" : "Usuario inactivado",
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}
}