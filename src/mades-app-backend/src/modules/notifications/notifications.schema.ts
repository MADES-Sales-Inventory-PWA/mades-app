import { z } from 'zod';
import { productSchema } from '../products/products.schema';
import { successResponseWithDataSchema } from '../../core/models/base.responses.schema';

export const CreateNotificationDTOSchema = z.object({
  currentStock: z.number().int({ message: "El stock actual debe ser un número entero" }),
  minStock: z.number().int({ message: "El stock mínimo debe ser un número entero" }),
  productId: z.number().int({ message: "El ID del producto debe ser un número entero" }),
});

const notificationProductSchema = z.object({
  id: productSchema.shape.id,
  name: productSchema.shape.name,
  barcode: productSchema.shape.barcode,
});

const notificationSchema = z.object({
  minStock: z.number().int().nonnegative(),
  currentStock: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  product: notificationProductSchema,
});

export const getNotificationsResponseSchema = successResponseWithDataSchema(
  z.array(notificationSchema)
);

export type GetNotificationsResponse = z.infer<typeof getNotificationsResponseSchema>;
export type NotificationDTO = z.infer<typeof notificationSchema>;
export type NotificationProductDTO = z.infer<typeof notificationProductSchema>;

export type CreateNotificationDTO = z.infer<typeof CreateNotificationDTOSchema>;