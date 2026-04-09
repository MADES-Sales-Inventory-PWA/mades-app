import { personSchema } from "../../../modules/persons/persons.schema";
import { z } from "zod";

export const tokenPayloadSchema = personSchema.pick({
  name: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  documentType: true,
  documentNumber: true
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;