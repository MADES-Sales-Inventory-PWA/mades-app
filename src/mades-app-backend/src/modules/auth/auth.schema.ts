import { z } from "zod";

export const loginSchema = z.object({
    userName: z.string().trim().min(1, "El usuario es requerido"),
    password: z.string().trim().min(1, "La contraseña es requerida"),
});
export type LoginDTO = z.infer<typeof loginSchema>;