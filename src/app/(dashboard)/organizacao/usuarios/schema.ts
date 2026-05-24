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

export const editAdminUserSchema = z
  .object({
    name: z.string().min(1, { message: "errors.nameRequired" }),
    email: z
      .string()
      .min(1, { message: "errors.emailRequired" })
      .email({ message: "errors.invalidEmail" }),
    password: z.string().optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "errors.passwordTooShort",
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: "errors.passwordsDoNotMatch",
        });
      }
    }
  });

export type EditAdminUserFormData = z.infer<typeof editAdminUserSchema>;
