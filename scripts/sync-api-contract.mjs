import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const CONTRACTS = {
  "openapi.json": "https://primeproperty.cfd/api/docs/openapi.json",
  "llms.txt": "https://primeproperty.cfd/llms.txt",
  "guest-flow.json": "https://primeproperty.cfd/api/docs/guest-flow.json",
};

const outputDirectory = resolve(process.cwd(), "docs/api");
await mkdir(outputDirectory, { recursive: true });

for (const [fileName, url] of Object.entries(CONTRACTS)) {
  const response = await fetch(url, {
    headers: { Accept: fileName.endsWith(".json") ? "application/json" : "text/plain" },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const contents = await response.text();
  if (fileName.endsWith(".json")) {
    JSON.parse(contents);
  }

  await writeFile(resolve(outputDirectory, fileName), `${contents.trim()}\n`, "utf8");
}

console.log(`Synchronized ${Object.keys(CONTRACTS).length} API contract files.`);
