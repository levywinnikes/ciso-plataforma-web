"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type AssistantChatFormData, assistantChatFormSchema } from "./schema";

export function useAssistantChatForm() {
  return useForm<AssistantChatFormData>({
    resolver: zodResolver(assistantChatFormSchema),
    defaultValues: { message: "" },
  });
}
