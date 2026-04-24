import { z } from 'zod'

// ── DTOs que espeja el backend ────────────────────────────────────────────────

export const sizeTypeSchema = z.object({
  id:   z.number().int().positive(),
  name: z.string().min(1),
})

export const sizeValueSchema = z.object({
  id:         z.number().int().positive(),
  sizeTypeId: z.number().int().positive(),
  value:      z.string().min(1),
})

export const sizeTypeIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'El ID debe ser un número entero positivo')
    .transform(Number)
    .refine(n => n > 0, 'El ID debe ser mayor a 0'),
})

export type SizeTypeDTO  = z.infer<typeof sizeTypeSchema>
export type SizeValueDTO = z.infer<typeof sizeValueSchema>