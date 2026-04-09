import { z } from "zod";

export const userSchema = z.object({
    userName: z.string().trim().toLowerCase().refine((val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, { message: "Formato de correo electrónico inválido" }).optional(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    rolId: z.number().int().positive("Id de rol no valido") 
});

export type CreateUserDTO = z.infer<typeof userSchema>;