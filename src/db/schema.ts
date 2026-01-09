import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  doublePrecision,
  integer,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// BEACHES TABLE - Main entity
// ============================================================================
export const beaches = pgTable(
  "beaches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).notNull(),
    region: varchar("region", { length: 255 }),
    lat: doublePrecision("lat").notNull(),
    lon: doublePrecision("lon").notNull(),
    description: text("description"),
    shortDescription: text("short_description"),
    crowdLevel: varchar("crowd_level", { length: 100 }),
    accessibility: varchar("accessibility", { length: 255 }),
    entryFee: varchar("entry_fee", { length: 255 }),
    rating: doublePrecision("rating").default(0),
    reviewCount: integer("review_count").default(0),
    fetchedAt: timestamp("fetched_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("beaches_slug_idx").on(table.slug),
    index("beaches_country_idx").on(table.country),
  ]
);

export const beachRelations = relations(beaches, ({ many }) => ({
  photos: many(photos),
  activities: many(activities),
  vibes: many(vibes),
  facilities: many(facilities),
  bestMonths: many(bestMonths),
  favorites: many(favorites),
}));

// ============================================================================
// PHOTOS TABLE - Beach photos with photographer attribution
// ============================================================================
export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  beachId: uuid("beach_id")
    .notNull()
    .references(() => beaches.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  photographer: varchar("photographer", { length: 255 }),
  photographerUrl: text("photographer_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoRelations = relations(photos, ({ one }) => ({
  beach: one(beaches, {
    fields: [photos.beachId],
    references: [beaches.id],
  }),
}));

// ============================================================================
// ACTIVITIES TABLE - Beach activities (many-to-one)
// ============================================================================
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  beachId: uuid("beach_id")
    .notNull()
    .references(() => beaches.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const activityRelations = relations(activities, ({ one }) => ({
  beach: one(beaches, {
    fields: [activities.beachId],
    references: [beaches.id],
  }),
}));

// ============================================================================
// VIBES TABLE - Beach vibes/atmosphere (many-to-one)
// ============================================================================
export const vibes = pgTable("vibes", {
  id: uuid("id").primaryKey().defaultRandom(),
  beachId: uuid("beach_id")
    .notNull()
    .references(() => beaches.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const vibeRelations = relations(vibes, ({ one }) => ({
  beach: one(beaches, {
    fields: [vibes.beachId],
    references: [beaches.id],
  }),
}));

// ============================================================================
// FACILITIES TABLE - Beach facilities (many-to-one)
// ============================================================================
export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  beachId: uuid("beach_id")
    .notNull()
    .references(() => beaches.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const facilityRelations = relations(facilities, ({ one }) => ({
  beach: one(beaches, {
    fields: [facilities.beachId],
    references: [beaches.id],
  }),
}));

// ============================================================================
// BEST MONTHS TABLE - Best months to visit (many-to-one)
// ============================================================================
export const bestMonths = pgTable("best_months", {
  id: uuid("id").primaryKey().defaultRandom(),
  beachId: uuid("beach_id")
    .notNull()
    .references(() => beaches.id, { onDelete: "cascade" }),
  month: integer("month").notNull(), // 1-12
});

export const bestMonthRelations = relations(bestMonths, ({ one }) => ({
  beach: one(beaches, {
    fields: [bestMonths.beachId],
    references: [beaches.id],
  }),
}));

// ============================================================================
// FAVORITES TABLE - User favorites (session-based for now)
// ============================================================================
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  beachId: uuid("beach_id")
    .notNull()
    .references(() => beaches.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favoriteRelations = relations(favorites, ({ one }) => ({
  beach: one(beaches, {
    fields: [favorites.beachId],
    references: [beaches.id],
  }),
}));

// ============================================================================
// SUBSCRIBERS TABLE - Newsletter signups
// ============================================================================
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Beach = typeof beaches.$inferSelect;
export type NewBeach = typeof beaches.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Vibe = typeof vibes.$inferSelect;
export type NewVibe = typeof vibes.$inferInsert;
export type Facility = typeof facilities.$inferSelect;
export type NewFacility = typeof facilities.$inferInsert;
export type BestMonth = typeof bestMonths.$inferSelect;
export type NewBestMonth = typeof bestMonths.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
