import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createServer } from "node:net";

const rootDir = process.cwd();
const nodeBin = process.execPath;
const viteBin = resolve(rootDir, "node_modules", "vite", "bin", "vite.js");
const backendCli = resolve(rootDir, "backend", "node_modules", "tsx", "dist", "cli.mjs");

const children = [];
let shuttingDown = false;

function startProcess(name, file, args, cwd) {
  const child = spawn(nodeBin, [file, ...args], {
    cwd,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
    console.error(`[${name}] exited with ${reason}`);
    shuttingDown = true;

    for (const other of children) {
      if (other.pid && other.pid !== child.pid) {
        other.kill();
      }
    }

    process.exit(code ?? 1);
  });

  children.push(child);
  return child;
}

async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", (err) => {
      server.close();
      resolve(err.code === "EADDRINUSE");
    });
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port, "127.0.0.1");
  });
}

function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of children) {
    child.kill();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);

async function main() {
  if (!backendCli || !viteBin) {
    throw new Error("Cannot locate local dev binaries. Run npm install first.");
  }

  const backendPort = 4000;
  const backendInUse = await isPortInUse(backendPort);
  if (backendInUse) {
    console.log(`Backend port ${backendPort} already in use; skipping backend startup.`);
  } else {
    startProcess("backend", backendCli, ["src/server.ts"], resolve(rootDir, "backend"));
  }

  startProcess("frontend", viteBin, [], rootDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
