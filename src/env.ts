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
