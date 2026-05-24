"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAppToast } from "@/hooks/use-app-toast";

import {
  type AdminUserFormData,
  adminUserSchema,
  type EditAdminUserFormData,
  editAdminUserSchema,
} from "./schema";

export function useAdminUsersForm(onSuccess?: () => void) {
  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();

  async function extractErrorKey(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? "errors.genericRequestFailed";
    } catch {
      return "errors.genericRequestFailed";
    }
  }

  async function onSubmit(data: AdminUserFormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/globals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        toast.error(await extractErrorKey(response));
        return;
      }

      form.reset();
      toast.success("Usuário criado com sucesso!");
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting };
}

export function useEditAdminUserForm(
  userId: string,
  defaultValues: { name: string; email: string },
  onSuccess?: () => void,
) {
  const form = useForm<EditAdminUserFormData>({
    resolver: zodResolver(editAdminUserSchema),
    defaultValues: { ...defaultValues, password: "", confirmPassword: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useAppToast();

  async function extractErrorKey(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? "errors.genericRequestFailed";
    } catch {
      return "errors.genericRequestFailed";
    }
  }

  async function onSubmit(data: EditAdminUserFormData) {
    setIsSubmitting(true);
    try {
      const payload: any = { name: data.name, email: data.email };
      if (data.password) {
        payload.password = data.password;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error(await extractErrorKey(response));
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting };
}
