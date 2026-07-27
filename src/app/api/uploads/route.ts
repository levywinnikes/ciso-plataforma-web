import { NextRequest, NextResponse } from "next/server";

import { apiError, requireSession } from "@/lib/api-auth";
import { getSpacesDownloadUrl, uploadToSpaces } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_ROLES = new Set(["PROFISSIONAL", "MEDICO", "ADMINISTRATIVO"]);

export async function POST(request: NextRequest) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  if (!auth.user.role || !ALLOWED_ROLES.has(auth.user.role)) {
    return apiError("errors.forbidden", 403);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError("errors.invalidUploadData", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return apiError("errors.fileRequired", 400);
  }

  if (file.size <= 0) {
    return apiError("errors.fileRequired", 400);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return apiError("errors.fileTooLarge", 400);
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return apiError("errors.fileTypeNotAllowed", 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToSpaces({
      fileName: file.name,
      body: buffer,
      contentType,
    });
    const url = await getSpacesDownloadUrl(uploaded.key);

    return NextResponse.json(
      {
        id: uploaded.key,
        fileName: uploaded.fileName,
        key: uploaded.key,
        url,
        uploadedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return apiError("errors.uploadFailed", 500);
  }
}
