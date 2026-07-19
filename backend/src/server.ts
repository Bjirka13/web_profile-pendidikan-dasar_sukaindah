import app from "./index.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const preferredPort = Number(process.env.PORT ?? process.env.VERCEL_PORT ?? 4000);
const port = Number.isFinite(preferredPort) && preferredPort > 0 ? preferredPort : 4000;
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  logger.info(`Backend scraping server running on http://${host}:${port}`);
});
