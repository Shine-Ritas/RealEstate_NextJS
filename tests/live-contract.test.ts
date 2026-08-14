import { describe, expect, it } from "vitest";

const runLive = process.env.RUN_LIVE_CONTRACT_TESTS === "true";
const API_URL = process.env.PRIMEPROPERTY_API_URL ?? "https://primeproperty.cfd/api/v1";

describe.skipIf(!runLive)("read-only production contract smoke test", () => {
  const publicReads = ["/", "/properties/options", "/locations/provinces", "/languages"];

  for (const path of publicReads) {
    it(`GET ${path} returns JSON without mutating production`, async () => {
      const response = await fetch(`${API_URL}${path}`, {
        headers: { Accept: "application/json" },
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get("content-type")).toContain("application/json");
      expect(await response.json()).toBeDefined();
    });
  }
});
