import { Request, Response } from "express";
import { UserService } from "./users.service"
import { z } from "zod";
import { UserMapper } from "./users.mapper";
import { userSchema } from "./users.schema";

export class UserController{
    constructor(
            private readonly userService = new UserService()) { }

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
                const userData = userSchema.parse(req.body);
                const newUser = await this.userService.createUser(userData);
                const response = UserMapper.toResponse(newUser)
                res.status(201).json({
                    success: true,
                    data: response
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