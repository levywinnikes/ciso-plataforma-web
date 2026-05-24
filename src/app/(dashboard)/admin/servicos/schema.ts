import { z } from "zod";

export const editServiceSchema = z.object({
  name: z.string().min(1, "errors.nameRequired"),
  price: z
    .number({ message: "errors.priceInvalid" })
    .positive("errors.pricePositive"),
});

export type EditServiceFormData = z.infer<typeof editServiceSchema>;
