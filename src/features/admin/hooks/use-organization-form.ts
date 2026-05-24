import { zodResolver } from "@hookform/resolvers/zod";
import { OrganizationType } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

// --- SCHEMAS ---

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "errors.required"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  adminName: z.string().min(1, "errors.required"),
  adminEmail: z.string().email("errors.invalidEmail"),
  adminPassword: z.string().min(8, "errors.passwordTooShort"),
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;

export const editOrganizationSchema = z.object({
  name: z.string().min(1, "errors.required"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
});

export type EditOrganizationData = z.infer<typeof editOrganizationSchema>;

export const createLocalUserSchema = z.object({
  name: z.string().min(1, "errors.required"),
  email: z.string().email("errors.invalidEmail"),
  password: z.string().min(8, "errors.passwordTooShort"),
  isAdmin: z.boolean(),
});

export type CreateLocalUserData = z.infer<typeof createLocalUserSchema>;

// --- HOOKS ---

export function useCreateOrganizationForm(
  type: OrganizationType,
  onSuccess: () => Promise<void> | void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();
  const tError = useFormError();

  const form = useForm<CreateOrganizationData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      phone: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  async function onSubmit(data: CreateOrganizationData) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });

      if (!response.ok) {
        let errorKey = "errors.genericRequestFailed";
        try {
          const body = await response.json();
          if (body.error) errorKey = body.error;
        } catch {}
        toast.error(tError(errorKey) ?? "");
        return;
      }

      toast.success("Organização criada com sucesso!");
      form.reset();
      await onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting };
}

export function useEditOrganizationForm(
  organizationId: string,
  defaultValues: EditOrganizationData,
  onSuccess: () => Promise<void> | void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();
  const tError = useFormError();

  const form = useForm<EditOrganizationData>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues,
  });

  async function onSubmit(data: EditOrganizationData) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorKey = "errors.genericRequestFailed";
        try {
          const body = await response.json();
          if (body.error) errorKey = body.error;
        } catch {}
        toast.error(tError(errorKey) ?? "");
        return;
      }

      toast.success("Organização atualizada com sucesso!");
      await onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting };
}

export function useCreateLocalUserForm(
  organizationId: string | null,
  role: string,
  onSuccess: () => Promise<void> | void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();
  const tError = useFormError();

  const form = useForm<CreateLocalUserData>({
    resolver: zodResolver(createLocalUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isAdmin: false,
    },
  });

  async function onSubmit(data: CreateLocalUserData) {
    if (!organizationId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, role }),
        },
      );

      if (!response.ok) {
        let errorKey = "errors.genericRequestFailed";
        try {
          const body = await response.json();
          if (body.error) errorKey = body.error;
        } catch {}
        toast.error(tError(errorKey) ?? "");
        return;
      }

      toast.success("Usuário criado com sucesso!");
      form.reset();
      await onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting };
}
