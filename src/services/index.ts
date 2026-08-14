import type { ApiClient } from "@/lib/api/client";

import { createArticleService } from "./article.service";
import { createAuthService } from "./auth.service";
import { createContentService } from "./content.service";
import { createFavoriteService } from "./favorite.service";
import { createLocationService } from "./location.service";
import { createNewsletterService } from "./newsletter.service";
import { createProfileService } from "./profile.service";
import { createPropertyService } from "./property.service";
import { createServiceService } from "./service.service";

/**
 * Kept explicit so CI can prove that every operation in the pinned OpenAPI
 * contract has a maintained frontend service wrapper.
 */
export const IMPLEMENTED_OPERATION_IDS = [
  "serviceIndex",
  "getBootstrap",
  "getHome",
  "listProperties",
  "getPropertyOptions",
  "getPropertyMap",
  "getProperty",
  "recordPropertyView",
  "createPropertyEnquiry",
  "listProvinces",
  "listDistricts",
  "listSubdistricts",
  "listArticles",
  "getArticle",
  "listArticleTags",
  "recordArticleView",
  "getPrivacyPolicy",
  "getTerms",
  "listLanguages",
  "getLanguage",
  "chat",
  "register",
  "login",
  "googleLogin",
  "forgotPassword",
  "resetPassword",
  "verifyEmail",
  "resendVerification",
  "logoutCurrentDevice",
  "logoutAllDevices",
  "getProfile",
  "updateProfile",
  "uploadAvatar",
  "deleteAvatar",
  "listFavorites",
  "addFavorite",
  "removeFavorite",
  "getNewsletterSubscription",
  "updateNewsletterSubscription",
  "deleteNewsletterSubscription",
] as const;

export function createApiServices(client: ApiClient) {
  return {
    service: createServiceService(client),
    properties: createPropertyService(client),
    locations: createLocationService(client),
    articles: createArticleService(client),
    content: createContentService(client),
    auth: createAuthService(client),
    profile: createProfileService(client),
    favorites: createFavoriteService(client),
    newsletter: createNewsletterService(client),
  };
}

export * from "./article.service";
export * from "./auth.service";
export * from "./content.service";
export * from "./favorite.service";
export * from "./location.service";
export * from "./newsletter.service";
export * from "./profile.service";
export * from "./property.service";
export * from "./service.service";
