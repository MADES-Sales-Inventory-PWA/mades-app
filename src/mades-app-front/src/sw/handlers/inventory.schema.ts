import { z } from 'zod'

export const adjustmentTypeSchema = z.enum(['LOSS', 'GAIN'])

export const adjustmentReasonSchema = z.enum([
  'DAMAGED',
  'LOST',
  'STOLEN',
  'RETURN',
  'RESTOCK',
  'MANUAL',
])

export const createInventoryAdjustmentSchema = z.object({
  productId: z.number().int().positive('El id del producto no es válido'),
  type: adjustmentTypeSchema,
  quantity: z.number().int().positive('La cantidad debe ser mayor que cero'),
  reason: adjustmentReasonSchema,
  notes: z
    .string()
    .trim()
    .max(250, 'La nota no puede superar los 250 caracteres')
    .optional(),
}).superRefine((data, ctx) => {
  const allowedByType: Record<z.infer<typeof adjustmentTypeSchema>, string[]> = {
    LOSS: ['DAMAGED', 'LOST', 'STOLEN', 'MANUAL'],
    GAIN: ['RETURN', 'RESTOCK', 'MANUAL'],
  }

  if (!allowedByType[data.type].includes(data.reason)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['reason'],
      message: `La razón ${data.reason} no es válida para el tipo ${data.type}`,
    })
  }
})

export const adjustmentFiltersSchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: adjustmentTypeSchema.optional(),
  reason: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateInventoryAdjustmentDTO = z.infer<typeof createInventoryAdjustmentSchema>
export type AdjustmentFiltersDTO = z.infer<typeof adjustmentFiltersSchema>