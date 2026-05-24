import { z } from "zod";

export const adminUserSchema = z.object({
  name: z.string().min(1, { message: "errors.nameRequired" }),
  email: z
    .string()
    .min(1, { message: "errors.emailRequired" })
    .email({ message: "errors.invalidEmail" }),
  password: z.string().min(8, { message: "errors.passwordTooShort" }),
});

export type AdminUserFormData = z.infer<typeof adminUserSchema>;
