import { z } from "zod";

const reasonEnum = z.enum([
  "DAMAGED",
  "LOST",
  "STOLEN",
  "RETURN",
  "RESTOCK",
  "MANUAL",
]);

export const reportFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  employeeId: z.coerce.number().int().positive().optional(),
  reason: reasonEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ReportFiltersDTO = z.infer<typeof reportFiltersSchema>;
export type ReportReason = z.infer<typeof reasonEnum>;

export const salesPerDay = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha invalido",
    })
    .transform((val) => new Date(val)),
});
export type SalesPerDayDTO = z.infer<typeof salesPerDay>