"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { type AdminUserFormData, adminUserSchema } from "./schema";

export function useAdminUsersForm(onSuccess?: () => void) {
  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function extractErrorKey(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? "errors.genericRequestFailed";
    } catch {
      return "errors.genericRequestFailed";
    }
  }

  async function onSubmit(data: AdminUserFormData) {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/globals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setErrorMessage(await extractErrorKey(response));
        return;
      }

      form.reset();
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit, isSubmitting, errorMessage, setErrorMessage };
}
