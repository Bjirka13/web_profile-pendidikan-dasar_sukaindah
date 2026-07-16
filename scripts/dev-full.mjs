import { spawn } from "node:child_process";
import { resolve } from "node:path";

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

if (!backendCli || !viteBin) {
  throw new Error("Cannot locate local dev binaries. Run npm install first.");
}

startProcess("backend", backendCli, ["src/index.ts"], resolve(rootDir, "backend"));
startProcess("frontend", viteBin, [], rootDir);
