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
  DO_SPACES_ENDPOINT: z.string().optional().default(""),
  DO_SPACES_REGION: z.string().optional().default(""),
  DO_SPACES_BUCKET: z.string().optional().default(""),
  DO_SPACES_KEY: z.string().optional().default(""),
  DO_SPACES_SECRET: z.string().optional().default(""),
  DO_SPACES_FOLDER: z.string().optional().default("integravisao"),
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

export function getSpacesConfig() {
  const endpoint = env.DO_SPACES_ENDPOINT.trim();
  const region = env.DO_SPACES_REGION.trim();
  const bucket = env.DO_SPACES_BUCKET.trim();
  const key = env.DO_SPACES_KEY.trim();
  const secret = env.DO_SPACES_SECRET.trim();
  const folder = env.DO_SPACES_FOLDER.trim() || "integravisao";

  if (!endpoint || !region || !bucket || !key || !secret) {
    throw new Error("errors.spacesConfigMissing");
  }

  try {
    // Validate endpoint shape without failing the whole app boot.
    // eslint-disable-next-line no-new
    new URL(endpoint);
  } catch {
    throw new Error("errors.spacesConfigInvalid");
  }

  // Bucket hostname as endpoint is a common misconfig:
  // https://mitcho.nyc3.digitaloceanspaces.com  → wrong
  // https://nyc3.digitaloceanspaces.com         → correct
  if (endpoint.includes(`.${region}.digitaloceanspaces.com`)) {
    throw new Error("errors.spacesEndpointInvalid");
  }

  return { endpoint, region, bucket, key, secret, folder };
}
