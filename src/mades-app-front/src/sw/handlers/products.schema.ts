import { z } from 'zod'

export const productSchema = z.object({
  id: z.number('El ID debe ser un número').int().positive(),

  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()'"/]+$/, 'El nombre contiene caracteres no permitidos'),

  sizeTypeId: z.number('El tipo de talla debe ser un número').int().positive('El tipo de talla debe ser un ID válido'),
  sizeValueId: z.number('El valor de talla debe ser un número').int().positive('El valor de talla debe ser un ID válido'),

  barcode: z.string()
    .min(8, 'El código de barras debe tener al menos 8 dígitos')
    .max(14, 'El código de barras no puede superar los 14 dígitos')
    .regex(/^[0-9]{8,14}$/, 'El código de barras debe contener solo dígitos (EAN-8 a EAN-14)'),

  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede superar los 1000 caracteres')
    .nullable(),

  imageUrl: z.string()
    .min(10, 'La URL de la imagen es demasiado corta')
    .max(500, 'La URL de la imagen no puede superar los 500 caracteres')
    .nullable(),

  purchasePrice: z.number('El precio de compra debe ser un número')
    .positive('El precio debe ser mayor a 0')
    .multipleOf(0.01, 'El precio no puede tener más de 2 decimales'),

  quantity: z.number('La cantidad debe ser un número').min(0),
  minQuantity: z.number('La cantidad mínima debe ser un número').int().nonnegative(),
  state: z.boolean('El estado debe ser un valor booleano'),
})

export const listProductsQueryRequestSchema = z.object({
  search:   z.string().trim().optional(),
  state:    z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  lowStock: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
})

export type ProductDTO = z.infer<typeof productSchema>
export type ListProductsQueryDTO = z.infer<typeof listProductsQueryRequestSchema>