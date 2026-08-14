export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  list: (page = 1) => [...favoriteQueryKeys.all, "list", page] as const,
} as const;
