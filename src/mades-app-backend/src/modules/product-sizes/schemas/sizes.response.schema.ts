import z from "zod";
import { sizeTypeSchema, sizeValueSchema } from "../sizes.schema";
import { successResponseWithDataSchema } from "../../../core/models/base.responses.schema";


const sizeTypeData = z.array(sizeTypeSchema);

const sizeValueData = z.array(sizeValueSchema);

export const listSizeTypesResponseSchema = successResponseWithDataSchema(sizeTypeData);

export const listSizeValuesResponseSchema = successResponseWithDataSchema(sizeValueData);