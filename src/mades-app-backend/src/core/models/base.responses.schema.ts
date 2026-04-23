import z from "zod";

export const successResponseSchema = z.object({
    success: z.literal(true),
    message: z.string()
        .min(5, "El mensaje de error debe tener al menos 5 caracteres")
        .max(500, "El mensaje de error no puede superar los 500 caracteres")
});

export const successResponseWithDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    successResponseSchema.extend({
        data: dataSchema
    });

export const errorResponseSchema = z.object({
    code: z.string()
        .min(3, "El código de error debe tener al menos 3 caracteres")
        .max(50, "El código de error no puede superar los 50 caracteres")
        .regex(/^[A-Z_]+$/, "El código de error debe contener solo letras mayúsculas y guiones bajos"),
    message: z.string()
        .min(5, "El mensaje de error debe tener al menos 5 caracteres")
        .max(500, "El mensaje de error no puede superar los 500 caracteres")
});