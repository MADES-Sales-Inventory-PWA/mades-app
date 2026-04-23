import { z } from "zod";

export const adjustmentTypeSchema = z.enum(["LOSS", "GAIN"]);

export const adjustmentReasonSchema = z.enum([
  "DAMAGED",
  "LOST",
  "STOLEN",
  "RETURN",
  "RESTOCK",
  "MANUAL",
]);

export const createInventoryAdjustmentSchema = z.object({
  productId: z.number().int().positive("El id del producto no es valido"),
  type: adjustmentTypeSchema,
  quantity: z.number().int().positive("La cantidad debe ser mayor que cero"),
  reason: adjustmentReasonSchema,
  notes: z
    .string()
    .trim()
    .max(250, "La nota no puede superar los 250 caracteres")
    .optional(),
}).superRefine((data, ctx) => {
  const allowedByType: Record<z.infer<typeof adjustmentTypeSchema>, string[]> = {
    LOSS: ["DAMAGED", "LOST", "STOLEN", "MANUAL"],
    GAIN: ["RETURN", "RESTOCK", "MANUAL"],
  };

  if (!allowedByType[data.type].includes(data.reason)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["reason"],
      message: `La razon ${data.reason} no es valida para el tipo ${data.type}`,
    });
  }
});

export type CreateInventoryAdjustmentDTO = z.infer<
  typeof createInventoryAdjustmentSchema
>;

export interface AdjustmentFilters {
  productId?: number;
  type?: "LOSS" | "GAIN";
  reason?: string;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
}
