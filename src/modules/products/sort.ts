/**
 * Single source of truth for product sorting.
 *
 * Previously `sortValues` was declared twice — once in `search-params.ts` (server
 * loader) and again in `hooks/use-product-filters.ts` (client hook). Two copies of
 * the same tuple meant the client could write a `?sort=` value the server loader
 * rejected. Both now import from here.
 */

export const sortValues = ["newest", "price_asc", "price_desc"] as const;

export type SortValue = (typeof sortValues)[number];

export const DEFAULT_SORT: SortValue = "newest";

export const sortOptions: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];
