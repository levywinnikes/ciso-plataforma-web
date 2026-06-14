import { z } from "zod";

export const editSurgerySchema = z.object({
  name: z.string().min(1, "errors.nameRequired"),
  defaultPrice: z
    .number({ message: "errors.priceInvalid" })
    .positive("errors.pricePositive"),
  active: z.boolean(),
});

export type EditSurgeryFormData = z.infer<typeof editSurgerySchema>;
