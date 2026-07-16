export async function readJsonBody(req: any): Promise<Record<string, unknown>> {
  if (req?.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }

  if (typeof req?.body === "string") {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function sendJson(res: any, statusCode: number, payload: unknown): void {
  res.status(statusCode).json(payload);
}

