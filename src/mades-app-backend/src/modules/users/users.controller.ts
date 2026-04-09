import { Request, Response } from "express";
import { UserService } from "./users.service"
import { z } from "zod";
import { createUserSchema } from "./users.schema";

export class UserController {
    private userService = new UserService();
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
}