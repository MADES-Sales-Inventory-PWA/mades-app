import { z } from "zod";
const DOCUMENT_TYPES = ['CC', 'CE', 'PASSPORT'] as const;
export const createUserSchema = z.object({
    name: z.string().min(1, "Ingrese el nombre del usuario").
        max(30, "El nombre del usuario no puede tener mas de 30 caracteres").transform(val => val.trim().replace(/\s+/g, ' ')),
    lastName: z.string().min(1, "Ingrese el apellido de la persona").
        max(30, "El apellido de la persona no puede tener mas de 30 caracteres").transform(val => val.trim().replace(/\s+/g, ' ')),
    email: z.string().trim().toLowerCase().refine((val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, { message: "Formato de correo electrónico inválido" }),
    phoneNumber: z.string()
        .min(7, "El número telefónico debe tener mínimo 7 dígitos")
        .max(16, "El numero de telefono puede tener máximo 15 dígitos (más el + opcional)")
        .regex(/^\+?\d+$/, "El número telefónico solo puede contener números y opcionalmente iniciar con +"),

    documentType: z.string().transform(val => val.trim().toUpperCase()).refine((val) => DOCUMENT_TYPES.includes(val as any), {
        message: "Tipo de documento no válido (CC, CE o PASAPORTE)",
    }),
    documentNumber: z.string().min(6, "Número de documento muy corto").max(12, "El número de documento no puede superar los 12 caracteres").transform(val => val.replace(/\s+/g, ''))
        .refine(val => /^\d+$/.test(val), {
            message: "El número de documento solo debe contener números"
        }),
    state: z.boolean().default(true),
    userId: z.number().int("El ID del usuario debe ser un número entero.").positive("Id de usuario no valido").optional(),
    userName: z.string().trim().toLowerCase().refine((val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, { message: "Formato de correo electrónico inválido" }).optional(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    rolId: z.number().int().positive("Id de rol no valido"),
});
export type CreateUserDTO = z.infer<typeof createUserSchema>;