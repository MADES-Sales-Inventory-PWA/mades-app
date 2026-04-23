import z from "zod";
import { productSchema } from "../products.schema";
import { successResponseSchema, successResponseWithDataSchema } from "../../../core/models/base.responses.schema";

export const productDataSchema = productSchema;

const listProductsData = z.array(productDataSchema);

export const createProductResponseSchema = successResponseWithDataSchema(productDataSchema);

export const listProductsResponseSchema = successResponseWithDataSchema(listProductsData);

export const getProductByIdResponseSchema = successResponseWithDataSchema(productDataSchema);

export const updateProductResponseSchema = successResponseWithDataSchema(productDataSchema);

export const setStateProductResponseSchema = successResponseSchema;