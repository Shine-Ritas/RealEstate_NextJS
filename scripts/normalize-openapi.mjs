import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourcePath = resolve(process.cwd(), "docs/api/openapi.json");
const outputPath = resolve(process.cwd(), "docs/api/openapi.codegen.json");
const document = JSON.parse(await readFile(sourcePath, "utf8"));

const genericData = document.components?.schemas?.GenericDataEnvelope?.properties?.data;
const chatItems =
  document.components?.schemas?.ChatEnvelope?.properties?.data?.properties?.items?.items;

if (!Array.isArray(genericData) || genericData.length !== 0) {
  throw new Error("Expected GenericDataEnvelope.data to be the upstream empty-array placeholder.");
}

if (!Array.isArray(chatItems) || chatItems.length !== 0) {
  throw new Error("Expected ChatEnvelope.items.items to be the upstream empty-array placeholder.");
}

document.components.schemas.GenericDataEnvelope.properties.data = {};
document.components.schemas.ChatEnvelope.properties.data.properties.items.items = {};

await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
console.log(
  "Normalized 2 intentionally unspecified OpenAPI schema placeholders for code generation.",
);
