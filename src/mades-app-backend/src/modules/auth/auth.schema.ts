import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().refine((val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }, { message: "Formato de correo electrónico inválido" }),
  password: z.string().min(1, "La contraseña es obligatoria")
});

export type LoginDTO = z.infer<typeof loginSchema>;
