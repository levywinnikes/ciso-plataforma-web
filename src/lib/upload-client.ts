"use client";

import type { ReferralDocument } from "@/features/referrals/types";

export type UploadedFileItem = Pick<ReferralDocument, "id" | "name"> & {
  url?: string;
  key?: string;
  uploadedAt?: string;
};

export async function uploadFilesToStorage(
  files: FileList | File[],
): Promise<UploadedFileItem[]> {
  const list = Array.from(files);
  const uploaded: UploadedFileItem[] = [];

  for (const file of list) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? "errors.uploadFailed");
    }

    const data = (await response.json()) as {
      id: string;
      fileName: string;
      key: string;
      url?: string;
      uploadedAt?: string;
    };

    uploaded.push({
      id: data.id,
      name: data.fileName,
      key: data.key,
      url: data.url,
      uploadedAt: data.uploadedAt,
    });
  }

  return uploaded;
}
