import { z } from "zod";

const localeSchema = z.enum(["en", "my", "th", "zh"]);
const listingTypeSchema = z.enum(["sale", "rent", "both"]);
const propertyTypeSchema = z.enum([
  "condo",
  "house",
  "apartment",
  "townhouse",
  "villa",
  "land",
  "commercial",
  "off-plan",
  "project",
]);
const projectStatusSchema = z.enum([
  "under_construction",
  "completed",
  "units_available",
  "units_unavailable",
]);

const propertySearchShape = {
  locale: localeSchema.optional(),
  q: z.string().max(120).optional(),
  listing_type: listingTypeSchema.optional(),
  property_type: propertyTypeSchema.optional(),
  project_status: projectStatusSchema.optional(),
  p_code: z.string().min(1).optional(),
  d_code: z.string().min(1).optional(),
  s_code: z.string().min(1).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  min_bedrooms: z.number().int().min(0).max(20).optional(),
  min_bathrooms: z.number().int().min(0).max(20).optional(),
  facility_ids: z.array(z.number().int().positive()).max(30).optional(),
  quick_all_residential: z.boolean().optional(),
  quick_near_school: z.boolean().optional(),
  quick_budget: z.boolean().optional(),
  quick_condominium: z.boolean().optional(),
  quick_sustainable_living: z.boolean().optional(),
  quick_pet_friendly: z.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
  page: z.number().int().min(1).optional(),
  per_page: z.number().int().min(1).max(100).optional(),
} satisfies z.ZodRawShape;

function addSearchDependencies(
  value: {
    p_code?: string;
    d_code?: string;
    s_code?: string;
    min_price?: number;
    max_price?: number;
  },
  context: z.RefinementCtx,
) {
  if (value.d_code && !value.p_code) {
    context.addIssue({
      code: "custom",
      path: ["d_code"],
      message: "District requires a province.",
    });
  }
  if (value.s_code && !value.d_code) {
    context.addIssue({
      code: "custom",
      path: ["s_code"],
      message: "Subdistrict requires a district.",
    });
  }
  if (
    value.min_price !== undefined &&
    value.max_price !== undefined &&
    value.max_price < value.min_price
  ) {
    context.addIssue({
      code: "custom",
      path: ["max_price"],
      message: "Maximum price must be greater than or equal to minimum price.",
    });
  }
}

export const propertySearchParamsSchema = z
  .object(propertySearchShape)
  .superRefine(addSearchDependencies);

const { page: _page, per_page: _perPage, ...mapSearchShape } = propertySearchShape;
void _page;
void _perPage;

export const propertyMapParamsSchema = z
  .object({
    ...mapSearchShape,
    north: z.number().optional(),
    south: z.number().optional(),
    east: z.number().optional(),
    west: z.number().optional(),
  })
  .superRefine(addSearchDependencies);

export const enquirySchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.email(),
  phone: z.string().trim().min(1).max(50),
  message: z.string().max(2000).nullable().optional(),
  agent_id: z.string().nullable().optional(),
});
