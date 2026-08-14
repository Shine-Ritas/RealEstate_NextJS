import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const requiredFiles = [
  ".env.example",
  ".github/workflows/ci.yml",
  "CONTRIBUTING.md",
  "docs/api/openapi.json",
  "docs/ui_elements_guide.md",
  "src/lib/api/client.ts",
  "src/services/index.ts",
];

for (const path of requiredFiles) {
  await readFile(path, "utf8");
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.private !== true) {
  throw new Error("Template package.json must remain private.");
}

const exampleEnvironment = await readFile(".env.example", "utf8");
if (!exampleEnvironment.includes("PRIMEPROPERTY_API_URL=https://primeproperty.cfd/api/v1")) {
  throw new Error(".env.example must contain the verified PrimeProperty API base URL.");
}
if (exampleEnvironment.includes("NEXT_PUBLIC_API_URL")) {
  throw new Error("The upstream API URL must not be browser-exposed.");
}

const trackedResult = spawnSync("git", ["ls-files"], { encoding: "utf8" });
if (trackedResult.status !== 0) {
  throw new Error(trackedResult.stderr || "Unable to inspect tracked files.");
}

const forbiddenTrackedPaths = trackedResult.stdout
  .split("\n")
  .filter(Boolean)
  .filter(
    (path) =>
      (/^\.env(?:\..+)?$/.test(path) && path !== ".env.example") ||
      path.startsWith(".next/") ||
      path.startsWith("node_modules/") ||
      path.startsWith("coverage/") ||
      path.endsWith(".pem"),
  );

if (forbiddenTrackedPaths.length > 0) {
  throw new Error(`Template contains forbidden tracked files: ${forbiddenTrackedPaths.join(", ")}`);
}

const exposedApiSearch = spawnSync(
  "git",
  ["grep", "-n", "NEXT_PUBLIC_API_URL", "--", "src", ".env.example"],
  { encoding: "utf8" },
);
if (exposedApiSearch.status === 0 && exposedApiSearch.stdout.trim()) {
  throw new Error(`Browser-exposed upstream API configuration found:\n${exposedApiSearch.stdout}`);
}
if (exposedApiSearch.status !== 0 && exposedApiSearch.status !== 1) {
  throw new Error(exposedApiSearch.stderr || "Unable to inspect API configuration.");
}

console.log("GitHub template hygiene checks passed.");
