import z from "zod";
import { listSizeTypesResponseSchema, listSizeValuesResponseSchema } from "../schemas";

export type listSizeTypesResponseDTO = z.infer<typeof listSizeTypesResponseSchema>;

export type listSizeValuesResponseDTO = z.infer<typeof listSizeValuesResponseSchema>;