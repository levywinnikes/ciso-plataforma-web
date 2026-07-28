import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import { env, getSpacesConfig } from "@/env";

function getSpacesClient() {
  const config = getSpacesConfig();
  return {
    config,
    client: new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.key,
        secretAccessKey: config.secret,
      },
      forcePathStyle: false,
    }),
  };
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function getFolderPrefix() {
  return env.DO_SPACES_FOLDER.trim() || "integravisao";
}

export function buildStorageObjectKey(originalName: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(originalName);

  return `${getFolderPrefix()}/${year}/${month}/${randomUUID()}-${safeName}`;
}

export async function uploadToSpaces(params: {
  fileName: string;
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; fileName: string }> {
  const { client, config } = getSpacesClient();
  const key = buildStorageObjectKey(params.fileName);

  // DigitalOcean Spaces: omit ACL (objects are private by default).
  // Passing ACL often causes AccessDenied in production.
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );

  return { key, fileName: params.fileName };
}

export async function getSpacesDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { client, config } = getSpacesClient();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deleteFromSpaces(key: string): Promise<void> {
  const { client, config } = getSpacesClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

export function isSpacesObjectKey(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith(`${getFolderPrefix()}/`);
}

export async function resolveDocumentUrl(
  storedValue: string | null | undefined,
): Promise<string | undefined> {
  if (!storedValue) return undefined;
  if (!isSpacesObjectKey(storedValue)) return storedValue;

  try {
    return await getSpacesDownloadUrl(storedValue);
  } catch (error) {
    console.error("Failed to sign Spaces URL:", error);
    return undefined;
  }
}
