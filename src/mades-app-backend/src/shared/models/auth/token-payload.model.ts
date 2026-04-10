import { z } from "zod";

export const tokenPayloadSchema = z.object({
  userId: z.number().int().positive(),
  userName: z.string().min(1),
  roleId: z.number().int().positive(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;