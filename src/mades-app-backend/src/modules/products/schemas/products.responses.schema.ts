import z from "zod";
import { productSchema } from "../products.schema";
import { successResponseSchema, successResponseWithDataSchema } from "../../../core/models/base.responses.schema";

const productData = productSchema;

const listProductsData = z.array(productSchema);

export const createProductResponseSchema = successResponseWithDataSchema(productData);

export const listProductsResponseSchema = successResponseWithDataSchema(listProductsData);

export const getProductByIdResponseSchema = successResponseWithDataSchema(productData);

export const updateProductResponseSchema = successResponseWithDataSchema(productData);

export const setStateProductResponseSchema = successResponseSchema;