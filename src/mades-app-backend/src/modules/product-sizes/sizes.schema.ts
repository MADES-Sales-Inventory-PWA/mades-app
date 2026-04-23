import { z } from "zod";

export const sizeTypeSchema = z.object({
    id: z.number("El ID debe ser un número")
        .int()
        .positive(),

    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede superar los 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/, "El nombre contiene caracteres no permitidos"),
});

export const sizeValueSchema = z.object({
    id: z.number("El ID debe ser un número")
        .int()
        .positive(),

    sizeTypeId: z.number("El tipo de talla debe ser un número")
        .int()
        .positive("El tipo de talla debe ser un ID válido"),

    value: z.string()
        .min(1, "El valor no puede estar vacío")
        .max(20, "El valor no puede superar los 20 caracteres")
        .regex(/^[a-zA-Z0-9\s\-\/\.]+$/, "Formato de talla inválido (ej: S, M, XL, 42, 28x30)"),

    sortOrder: z.number("El orden debe ser un número")
        .int()
        .nonnegative("El orden no puede ser negativo")
        .max(999)
        .default(0),
});