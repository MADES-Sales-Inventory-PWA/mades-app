import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service";
import { loginSchema } from "./auth.schema";

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const loginData = loginSchema.parse(req.body);
      const result = await this.authService.login(loginData);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: error.issues[0]?.message ?? "Error de validación"
        });
      }

      return res.status(401).json({
        success: false,
        message: error.message || "Error de autenticación"
      });
    }
  }
}
