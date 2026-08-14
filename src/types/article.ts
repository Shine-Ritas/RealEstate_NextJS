import type { ApiSchema, OperationQuery } from "@/lib/api/contract";

export type ArticleSummary = ApiSchema<"ArticleSummary">;
export type ArticleDetail = ApiSchema<"ArticleDetail">;
export type ArticlePage = ApiSchema<"ArticlePage">;
export type ArticleListParams = OperationQuery<"listArticles">;
