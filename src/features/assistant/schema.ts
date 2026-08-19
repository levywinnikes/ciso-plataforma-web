import { z } from "zod";

import {
  ASSISTANT_HISTORY_MAX_TURNS,
  ASSISTANT_MESSAGE_MAX_LENGTH,
} from "./constants";

export const assistantChatFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "errors.required" })
    .max(ASSISTANT_MESSAGE_MAX_LENGTH, {
      message: "errors.assistantMessageTooLong",
    }),
});

export type AssistantChatFormData = z.infer<typeof assistantChatFormSchema>;

export const assistantChatRequestSchema = assistantChatFormSchema.extend({
  locale: z.enum(["pt-BR", "en-US"]).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(ASSISTANT_MESSAGE_MAX_LENGTH),
      }),
    )
    .max(ASSISTANT_HISTORY_MAX_TURNS)
    .optional(),
});

export type AssistantChatRequest = z.infer<typeof assistantChatRequestSchema>;
