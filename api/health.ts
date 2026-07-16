import { sendJson } from "./_lib/json";

export default function handler(_req: any, res: any) {
  sendJson(res, 200, { status: "ok", version: "1.0.0" });
}

