import { z } from "zod";
import { createProductRequestSchema, listProductsQueryRequestSchema, setStateProductRequestSchema, updateProductRequestSchema } from "../schemas";

export type createProductRequestDTO = z.infer<typeof createProductRequestSchema>;

export type listProductsQueryDTO = z.infer<typeof listProductsQueryRequestSchema>;

export type updateProductRequestDTO = z.infer<typeof updateProductRequestSchema>;

export type setStateProductRequestDTO = z.infer<typeof setStateProductRequestSchema>;