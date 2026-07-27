import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import { env } from "@/env";

const spacesClient = new S3Client({
  region: env.DO_SPACES_REGION,
  endpoint: env.DO_SPACES_ENDPOINT,
  credentials: {
    accessKeyId: env.DO_SPACES_KEY,
    secretAccessKey: env.DO_SPACES_SECRET,
  },
  forcePathStyle: false,
});

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function buildStorageObjectKey(originalName: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(originalName);

  return `${env.DO_SPACES_FOLDER}/${year}/${month}/${randomUUID()}-${safeName}`;
}

export async function uploadToSpaces(params: {
  fileName: string;
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; fileName: string }> {
  const key = buildStorageObjectKey(params.fileName);

  await spacesClient.send(
    new PutObjectCommand({
      Bucket: env.DO_SPACES_BUCKET,
      Key: key,
      Body: params.body,
      ContentType: params.contentType,
      ACL: "private",
    }),
  );

  return { key, fileName: params.fileName };
}

export async function getSpacesDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  return getSignedUrl(
    spacesClient,
    new GetObjectCommand({
      Bucket: env.DO_SPACES_BUCKET,
      Key: key,
    }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deleteFromSpaces(key: string): Promise<void> {
  await spacesClient.send(
    new DeleteObjectCommand({
      Bucket: env.DO_SPACES_BUCKET,
      Key: key,
    }),
  );
}

export function isSpacesObjectKey(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith(`${env.DO_SPACES_FOLDER}/`);
}

export async function resolveDocumentUrl(
  storedValue: string | null | undefined,
): Promise<string | undefined> {
  if (!storedValue) return undefined;
  if (!isSpacesObjectKey(storedValue)) return storedValue;
  return getSpacesDownloadUrl(storedValue);
}
