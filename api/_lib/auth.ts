import { authenticateAdminSession } from "../../backend/src/supabase";
import { sendJson } from "./json";

export function getBearerToken(req: any): string {
  const header = req?.headers?.authorization || req?.headers?.Authorization || "";
  if (typeof header !== "string") {
    return "";
  }
  if (!header.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return header.slice(7).trim();
}

export function requireAdminSession(req: any, res: any) {
  const token = getBearerToken(req);
  if (!token) {
    sendJson(res, 401, { success: false, error: "Missing admin session token" });
    return null;
  }

  const session = authenticateAdminSession(token);
  if (!session) {
    sendJson(res, 401, { success: false, error: "Invalid or expired admin session" });
    return null;
  }

  return session;
}

