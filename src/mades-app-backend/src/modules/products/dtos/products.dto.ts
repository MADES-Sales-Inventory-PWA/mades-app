import z from "zod";
import { productDataSchema } from "../schemas";

export type productDTO = z.infer<typeof productDataSchema>;