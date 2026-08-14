import { describe, expect, it } from "vitest";

import { buildQueryString } from "@/lib/api/query";
import { propertyMapParamsSchema, propertySearchParamsSchema } from "@/schemas/property.schema";

describe("buildQueryString", () => {
  it("preserves explicit false and zero while omitting only absent and empty values", () => {
    const query = buildQueryString({
      quick_budget: false,
      min_price: 0,
      q: "",
      missing: undefined,
      nullable: null,
    });

    expect(query).toBe("?quick_budget=false&min_price=0");
  });

  it("serializes facility IDs as repeated bracketed keys", () => {
    const query = buildQueryString({ "facility_ids[]": [2, 7, 11] });
    const params = new URLSearchParams(query.slice(1));

    expect(params.getAll("facility_ids[]")).toEqual(["2", "7", "11"]);
  });
});

describe("property search validation", () => {
  it("requires province before district", () => {
    const result = propertySearchParamsSchema.safeParse({ d_code: "1001" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["d_code"]);
  });

  it("requires district before subdistrict", () => {
    const result = propertyMapParamsSchema.safeParse({ p_code: "10", s_code: "100101" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["s_code"]);
  });

  it("accepts the complete location hierarchy and map bounds", () => {
    expect(
      propertyMapParamsSchema.safeParse({
        p_code: "10",
        d_code: "1001",
        s_code: "100101",
        north: 14,
        south: 13,
        east: 101,
        west: 100,
      }).success,
    ).toBe(true);
  });
});
