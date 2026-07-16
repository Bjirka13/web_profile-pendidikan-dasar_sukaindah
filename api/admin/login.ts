import { validateAdminLogin } from "../../../backend/src/supabase";
import { readJsonBody, sendJson } from "../_lib/json";

export default async function handler(req: any, res: any) {
  if ((req?.method || "GET").toUpperCase() !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    sendJson(res, 400, { success: false, error: "Email admin dan password diperlukan" });
    return;
  }

  try {
    const session = await validateAdminLogin(username, password);
    if (!session) {
      sendJson(res, 401, { success: false, error: "Invalid admin credentials" });
      return;
    }

    sendJson(res, 200, { success: true, ...session });
  } catch (error) {
    console.error("Admin login failed:", error);
    sendJson(res, 500, { success: false, error: "Unable to authenticate admin" });
  }
}

