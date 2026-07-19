import { uploadCmsImage } from "../../../backend/src/supabase";
import { requireAdminSession } from "../_lib/auth";
import { readJsonBody, sendJson } from "../_lib/json";

export default async function handler(req: any, res: any) {
  if ((req?.method || "GET").toUpperCase() !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return;
  }

  const session = requireAdminSession(req, res);
  if (!session) {
    return;
  }

  const body = await readJsonBody(req);
  const fileName = typeof body.fileName === "string" ? body.fileName : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const base64 = typeof body.base64 === "string" ? body.base64 : "";
  const folder = typeof body.folder === "string" ? body.folder : "";
  const allowedFolders = [
    "school-hero",
    "school-card",
    "principal",
    "staff",
    "teachers",
    "facilities",
    "achievements",
    "news",
    "gallery",
  ];
  const normalizedFolder = folder.trim().toLowerCase() || "school-hero";

  if (!allowedFolders.includes(normalizedFolder)) {
    sendJson(res, 403, { success: false, error: "Upload folder is not allowed for this admin session" });
    return;
  }

  if (!fileName || !mimeType || !base64) {
    sendJson(res, 400, { success: false, error: "Missing fileName, mimeType, or base64" });
    return;
  }

  try {
    const result = await uploadCmsImage({
      fileName,
      mimeType,
      base64,
      folder: normalizedFolder,
      schoolId: session.schoolId,
      schoolSlug: session.schoolSlug,
      schoolName: session.schoolName,
    });

    sendJson(res, 200, { success: true, ...result });
  } catch (error) {
    console.error("Image upload failed:", error);
    sendJson(res, 500, { success: false, error: "Unable to upload image" });
  }
}
