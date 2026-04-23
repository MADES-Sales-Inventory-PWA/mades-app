import z from "zod";
import { sizeTypeIdRequestSchema } from "../schemas/sizes.request.schema";

export type SizeTypeIdRequestDTO = z.infer<typeof sizeTypeIdRequestSchema>;