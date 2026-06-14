import { z } from "zod";

export const editAgreementSchema = z.object({
  name: z.string().min(1, "errors.nameRequired"),
  active: z.boolean(),
});

export type EditAgreementFormData = z.infer<typeof editAgreementSchema>;
