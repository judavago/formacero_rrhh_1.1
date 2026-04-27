import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "formacero_rrhh_1.1");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm" : "npm";
const nodeCommand = process.execPath;

const children = [];
const exitAll = (code = 0) => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  });
  process.exit(code);
};

const spawnChild = (name, command, args, cwd) => {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: isWindows
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${name} exited via signal ${signal}`);
    } else {
      console.log(`${name} exited with code ${code}`);
    }

    if (code !== 0) {
      exitAll(code || 1);
      return;
    }

    console.log(`${name} exited cleanly; keeping dev launcher running so the detached server stays active.`);
  });

  child.on("error", (error) => {
    console.error(`${name} failed to start:`,
      error instanceof Error ? error.message : error);
    exitAll(1);
  });

  return child;
};

spawnChild("BACK", nodeCommand, ["server.js"], backendDir);
spawnChild("FRONT", npmCommand, ["run", "dev"], frontendDir);

process.on("SIGINT", () => exitAll(0));
process.on("SIGTERM", () => exitAll(0));
