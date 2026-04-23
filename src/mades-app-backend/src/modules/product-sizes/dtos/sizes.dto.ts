import z from "zod";
import { sizeTypeDataSchema, sizeValueDataSchema } from "../schemas";

export type SizeTypeDTO  = z.infer<typeof sizeTypeDataSchema>;
export type SizeValueDTO = z.infer<typeof sizeValueDataSchema>;