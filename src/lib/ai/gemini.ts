import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "@/env";
import { GEMINI_MODELS } from "@/features/assistant/constants";

function isRetryableGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number }).status;
  return (
    status === 429 ||
    message.includes("429") ||
    message.toLowerCase().includes("quota") ||
    message.includes("Resource has been exhausted") ||
    message.includes("503") ||
    message.toLowerCase().includes("unavailable")
  );
}

export async function generateGeminiText(prompt: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY.trim();
  if (!apiKey) {
    throw new Error("errors.assistantNotConfigured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (text) {
        return text;
      }
    } catch (error) {
      lastError = error;
      if (isRetryableGeminiError(error)) {
        continue;
      }
      continue;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("errors.assistantUnavailable");
}
