import z from "zod";
import { createProductResponseSchema, getProductByIdResponseSchema, listProductsResponseSchema, setStateProductResponseSchema, updateProductResponseSchema } from "../schemas";

export type createProductResponseDTO = z.infer<typeof createProductResponseSchema>;

export type listProductsResponseDTO = z.infer<typeof listProductsResponseSchema>;

export type getProductByIdResponseDTO = z.infer<typeof getProductByIdResponseSchema>;

export type updateProductResponseDTO = z.infer<typeof updateProductResponseSchema>;

export type setStateProductResponseDTO = z.infer<typeof setStateProductResponseSchema>;