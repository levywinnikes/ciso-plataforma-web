import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET é obrigatório"),
  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL deve ser uma URL válida")
    .default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DO_SPACES_ENDPOINT: z
    .string()
    .url("DO_SPACES_ENDPOINT deve ser uma URL válida"),
  DO_SPACES_REGION: z.string().min(1, "DO_SPACES_REGION é obrigatório"),
  DO_SPACES_BUCKET: z.string().min(1, "DO_SPACES_BUCKET é obrigatório"),
  DO_SPACES_KEY: z.string().min(1, "DO_SPACES_KEY é obrigatório"),
  DO_SPACES_SECRET: z.string().min(1, "DO_SPACES_SECRET é obrigatório"),
  DO_SPACES_FOLDER: z
    .string()
    .min(1, "DO_SPACES_FOLDER é obrigatório")
    .default("integravisao"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error("❌ Variáveis de ambiente inválidas:", formatted);
    throw new Error("Variáveis de ambiente inválidas. Verifique o .env.");
  }

  return result.data;
}

export const env = parseEnv();
