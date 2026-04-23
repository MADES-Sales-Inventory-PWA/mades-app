import z from "zod";

export const sizeTypeIdRequestSchema = z.object({
    id: z.coerce.number()
        .int("El ID debe ser un número entero")
        .positive("El ID debe ser mayor a 0"),
});