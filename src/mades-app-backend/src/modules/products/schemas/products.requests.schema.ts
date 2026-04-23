import { z } from "zod";
import { productSchema } from "../products.schema";

export const createProductRequestSchema = productSchema.omit({ id: true, state: true });

export const listProductsQueryRequestSchema = z.object({
    search:   z.string()
            .trim()
            .optional(),
    state:    z.enum(["true", "false"])
            .transform(val => val === "true")
            .optional(),
    lowStock: z.enum(["true", "false"])
            .transform(val => val === "true")
            .optional(),
});

export const updateProductRequestSchema = productSchema.omit({ id: true, quantity: true, state: true }).partial();

export const setStateProductRequestSchema = z.object({
    state: z.boolean("El estado debe ser un valor booleano")
});




