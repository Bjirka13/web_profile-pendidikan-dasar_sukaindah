import { deleteCmsSchoolRecord, syncCmsSchoolRecord } from "../../../backend/src/supabase";
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

  try {
    const body = await readJsonBody(req);
    const schools = Array.isArray(body.schools) ? body.schools : [];
    const deletedSchoolIds = Array.isArray(body.deletedSchoolIds)
      ? body.deletedSchoolIds.filter((item) => typeof item === "number")
      : [];

    const unauthorizedSchool = schools.some(
      (school: { id?: unknown }) => typeof school?.id === "number" && school.id !== session.schoolId
    );
    const unauthorizedDeletion = deletedSchoolIds.some((schoolId: number) => schoolId !== session.schoolId);

    if (unauthorizedSchool || unauthorizedDeletion) {
      sendJson(res, 403, { success: false, error: "Admin session is restricted to one school" });
      return;
    }

    if (schools.length === 0 && deletedSchoolIds.length === 0) {
      sendJson(res, 400, { success: false, error: "No schools provided" });
      return;
    }

    for (const school of schools) {
      await syncCmsSchoolRecord(school);
    }

    for (const schoolId of deletedSchoolIds) {
      await deleteCmsSchoolRecord(schoolId);
    }

    sendJson(res, 200, { success: true, count: schools.length, deletedCount: deletedSchoolIds.length });
  } catch (error) {
    console.error("Admin sync failed:", error);
    sendJson(res, 500, { success: false, error: "Unable to sync admin changes" });
  }
}

