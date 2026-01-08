import { z } from "zod";

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Input schema for getBeaches server function
 * Supports filtering by country, vibe, and activity
 * Uses cursor-based pagination for infinite scroll
 */
export const GetBeachesInputSchema = z.object({
  country: z.string().optional(),
  vibe: z.string().optional(),
  activity: z.string().optional(),
  limit: z.number().min(1).max(50).default(12),
  cursor: z.string().optional(), // Beach ID for cursor-based pagination
  favoritesOnly: z.boolean().optional(),
});

export type GetBeachesInput = z.infer<typeof GetBeachesInputSchema>;

/**
 * Input schema for getBeachBySlug server function
 */
export const GetBeachBySlugInputSchema = z.object({
  slug: z.string().min(1),
});

export type GetBeachBySlugInput = z.infer<typeof GetBeachBySlugInputSchema>;

/**
 * Input schema for toggleFavorite server function
 */
export const ToggleFavoriteInputSchema = z.object({
  beachId: z.string().uuid(),
});

export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteInputSchema>;

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

/**
 * Photo schema for output
 */
export const PhotoSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  thumbnail: z.string().nullable(),
  photographer: z.string().nullable(),
  photographerUrl: z.string().nullable(),
});

export type Photo = z.infer<typeof PhotoSchema>;

/**
 * Coordinates schema
 */
export const CoordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

/**
 * Beach list item - minimal beach data for list/card view
 */
export const BeachListItemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  region: z.string().nullable(),
  shortDescription: z.string().nullable(),
  crowdLevel: z.string().nullable(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  coordinates: CoordinatesSchema,
  primaryPhoto: PhotoSchema.nullable(),
  vibes: z.array(z.string()),
  isFavorite: z.boolean().optional(),
});

export type BeachListItem = z.infer<typeof BeachListItemSchema>;

/**
 * Beach detail - full beach data with all relations
 */
export const BeachDetailSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  region: z.string().nullable(),
  description: z.string().nullable(),
  shortDescription: z.string().nullable(),
  crowdLevel: z.string().nullable(),
  accessibility: z.string().nullable(),
  entryFee: z.string().nullable(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  coordinates: CoordinatesSchema,
  photos: z.array(PhotoSchema),
  vibes: z.array(z.string()),
  activities: z.array(z.string()),
  facilities: z.array(z.string()),
  bestMonths: z.array(z.number()),
  isFavorite: z.boolean().optional(),
  fetchedAt: z.string().nullable(),
});

export type BeachDetail = z.infer<typeof BeachDetailSchema>;

/**
 * Similar beach - minimal data for similar beaches section
 */
export const SimilarBeachSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  shortDescription: z.string().nullable(),
  primaryPhoto: PhotoSchema.nullable(),
  vibes: z.array(z.string()),
});

export type SimilarBeach = z.infer<typeof SimilarBeachSchema>;

/**
 * Response schema for getBeaches - includes pagination cursor
 */
export const GetBeachesResponseSchema = z.object({
  beaches: z.array(BeachListItemSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  totalCount: z.number().optional(),
});

export type GetBeachesResponse = z.infer<typeof GetBeachesResponseSchema>;

/**
 * Response schema for getBeachBySlug - includes similar beaches
 */
export const GetBeachBySlugResponseSchema = z.object({
  beach: BeachDetailSchema.nullable(),
  similarBeaches: z.array(SimilarBeachSchema),
});

export type GetBeachBySlugResponse = z.infer<typeof GetBeachBySlugResponseSchema>;

/**
 * Response schema for toggleFavorite
 */
export const ToggleFavoriteResponseSchema = z.object({
  beachId: z.string().uuid(),
  isFavorite: z.boolean(),
});

export type ToggleFavoriteResponse = z.infer<typeof ToggleFavoriteResponseSchema>;

// ============================================================================
// FILTER OPTIONS SCHEMAS
// ============================================================================

/**
 * Available filter options for the frontend
 */
export const FilterOptionsSchema = z.object({
  countries: z.array(z.string()),
  vibes: z.array(z.string()),
  activities: z.array(z.string()),
});

export type FilterOptions = z.infer<typeof FilterOptionsSchema>;
