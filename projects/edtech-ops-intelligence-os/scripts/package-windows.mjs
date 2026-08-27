import { spawnSync } from "node:child_process";

const signingVariables = ["CSC_LINK", "CSC_KEY_PASSWORD"];
const present = signingVariables.filter((key) => Boolean(process.env[key]));
const signingRequested = present.length > 0;

if (signingRequested && present.length !== signingVariables.length) {
  throw new Error("Windows signing requires both CSC_LINK and CSC_KEY_PASSWORD. Certificate material must be supplied through the environment, never committed to the project.");
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}.`);
}

const packageEnv = signingRequested ? process.env : { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: "false" };
console.log(signingRequested ? "Building a certificate-signed Windows release from environment-provided certificate references." : "Building an unsigned Windows release. No certificate was supplied; automatic signing is disabled.");
run("pnpm", ["desktop:build"]);
run("node", ["scripts/stage-desktop.mjs"]);
run("pnpm", ["exec", "electron-builder", "--project", "desktop-app", "--win", "portable"], packageEnv);
