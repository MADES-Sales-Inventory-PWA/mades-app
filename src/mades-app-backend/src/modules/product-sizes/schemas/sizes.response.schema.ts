import z from "zod";
import { sizeTypeSchema, sizeValueSchema } from "../sizes.schema";
import { successResponseWithDataSchema } from "../../../core/models/base.responses.schema";

export const sizeTypeDataSchema = sizeTypeSchema;

export const sizeValueDataSchema = sizeValueSchema.omit({ sizeTypeId: true, sortOrder: true });

const listSizeTypeDataSchema = z.array(sizeTypeDataSchema);

const listSizeValueDataSchema = z.array(sizeValueDataSchema);

export const listSizeTypesResponseSchema = successResponseWithDataSchema(listSizeTypeDataSchema);

export const listSizeValuesResponseSchema = successResponseWithDataSchema(listSizeValueDataSchema);