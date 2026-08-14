export const CACHE_TTL = {
  reference: 60 * 60,
  content: 5 * 60,
  property: 60,
} as const;

export const CACHE_TAGS = {
  bootstrap: "bootstrap",
  home: "home",
  properties: "properties",
  propertyOptions: "property-options",
  locations: "locations",
  articles: "articles",
  legal: "legal",
  languages: "languages",
} as const;
