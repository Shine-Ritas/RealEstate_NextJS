export const API_ENDPOINTS = {
  service: "/",
  bootstrap: "/bootstrap",
  home: "/home",
  properties: {
    list: "/properties",
    options: "/properties/options",
    map: "/properties/map",
    detail: (slug: string) => `/properties/${encodeURIComponent(slug)}`,
    views: (slug: string) => `/properties/${encodeURIComponent(slug)}/views`,
    enquiries: (slug: string) => `/properties/${encodeURIComponent(slug)}/enquiries`,
  },
  locations: {
    provinces: "/locations/provinces",
    districts: (provinceCode: string) =>
      `/locations/provinces/${encodeURIComponent(provinceCode)}/districts`,
    subdistricts: (districtCode: string) =>
      `/locations/districts/${encodeURIComponent(districtCode)}/subdistricts`,
  },
  articles: {
    list: "/articles",
    tags: "/article-tags",
    detail: (slug: string) => `/articles/${encodeURIComponent(slug)}`,
    views: (slug: string) => `/articles/${encodeURIComponent(slug)}/views`,
  },
  legal: {
    privacy: "/legal/privacy-policy",
    terms: "/legal/terms-and-conditions",
  },
  languages: {
    list: "/languages",
    detail: (locale: string) => `/languages/${encodeURIComponent(locale)}`,
  },
  chat: "/chat",
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/email/verify",
    resendVerification: "/auth/email/resend",
    token: "/auth/token",
    tokens: "/auth/tokens",
  },
  profile: {
    me: "/me",
    avatar: "/me/avatar",
  },
  favorites: {
    list: "/favorites",
    property: (propertyId: string) => `/favorites/${encodeURIComponent(propertyId)}`,
  },
  newsletter: "/newsletter-subscription",
} as const;
