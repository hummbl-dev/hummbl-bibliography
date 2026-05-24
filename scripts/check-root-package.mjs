import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

const requiredScripts = [
  "test",
  "validate",
  "validate:ci",
  "check-dups",
  "check-required-fields",
  "stats",
  "stats:json",
];

if (pkg.private !== true) {
  throw new Error("Root package.json must remain private; publish toolkit/ instead.");
}

if ("main" in pkg || "exports" in pkg) {
  throw new Error("Root package.json must not advertise a runtime entry point.");
}

for (const script of requiredScripts) {
  const command = pkg.scripts?.[script];
  if (!command?.includes("npm --prefix toolkit")) {
    throw new Error(`Root script ${script} must delegate to toolkit/.`);
  }
}

console.log("Root package boundary OK: private delegation shim.");
