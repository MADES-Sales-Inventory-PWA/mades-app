import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.number().int().positive("El id del producto no es válido"),
  quantity: z.number().int().positive("La cantidad debe ser mayor que cero"),
  price: z.number().nonnegative("El precio no puede ser negativo"),
});

export const createSaleSchema = z.object({
  items: z
    .array(saleItemSchema)
    .min(1, "La venta debe tener al menos un producto"),
  notes: z.string().trim().max(250, "La nota no puede superar 250 caracteres").optional(),
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;
export type SaleItemDTO = z.infer<typeof saleItemSchema>;