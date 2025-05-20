import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  primaryKey,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business profiles
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  address: text("address"),
  city: varchar("city").default("Croydon"),
  postcode: varchar("postcode"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  logo: varchar("logo"),
  coverImage: varchar("cover_image"),
  categoryId: integer("category_id").references(() => categories.id),
  established: varchar("established"),
  employeeCount: integer("employee_count"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products and services
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  isService: boolean("is_service").default(false),
  isPublic: boolean("is_public").default(true),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Special offers for members
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  discountPercentage: integer("discount_percentage"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulk member imports for admins
export const memberImports = pgTable("member_imports", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  importedCount: integer("imported_count").default(0),
  failures: jsonb("failures"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace listings (for member-to-member sales)
export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  quantity: integer("quantity").default(1),
  status: varchar("status").default("active").notNull(), // active, sold, expired, draft
  categoryId: integer("category_id").references(() => categories.id),
  isService: boolean("is_service").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Barter listings (for member-to-member trades without money)
export const barterListings = pgTable("barter_listings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  offering: text("offering").notNull(), // What the member is offering
  lookingFor: text("looking_for").notNull(), // What the member wants in exchange
  status: varchar("status").default("active").notNull(), // active, traded, expired, draft
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Transaction records between members
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: integer("listing_id").references(() => marketplaceListings.id),
  sellerBusinessId: integer("seller_business_id").notNull().references(() => businesses.id),
  buyerBusinessId: integer("buyer_business_id").notNull().references(() => businesses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending").notNull(), // pending, completed, canceled, disputed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Barter exchanges between members
export const barterExchanges = pgTable("barter_exchanges", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: integer("listing_id").references(() => barterListings.id),
  initiatorBusinessId: integer("initiator_business_id").notNull().references(() => businesses.id),
  responderBusinessId: integer("responder_business_id").notNull().references(() => businesses.id),
  initiatorOffer: text("initiator_offer").notNull(),
  responderOffer: text("responder_offer").notNull(),
  status: varchar("status").default("proposed").notNull(), // proposed, accepted, completed, declined, canceled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Define relations
export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  products: many(products),
  offers: many(offers),
  marketplaceListings: many(marketplaceListings),
  barterListings: many(barterListings),
  sellerTransactions: many(transactions, { relationName: "sellerTransactions" }),
  buyerTransactions: many(transactions, { relationName: "buyerTransactions" }),
  initiatedBarterExchanges: many(barterExchanges, { relationName: "initiatedBarterExchanges" }),
  respondedBarterExchanges: many(barterExchanges, { relationName: "respondedBarterExchanges" }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  business: one(businesses, {
    fields: [offers.businessId],
    references: [businesses.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  businesses: many(businesses),
  products: many(products),
  marketplaceListings: many(marketplaceListings),
  barterListings: many(barterListings),
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one, many }) => ({
  business: one(businesses, {
    fields: [marketplaceListings.businessId],
    references: [businesses.id],
  }),
  category: one(categories, {
    fields: [marketplaceListings.categoryId],
    references: [categories.id],
  }),
  transactions: many(transactions),
}));

export const barterListingsRelations = relations(barterListings, ({ one, many }) => ({
  business: one(businesses, {
    fields: [barterListings.businessId],
    references: [businesses.id],
  }),
  category: one(categories, {
    fields: [barterListings.categoryId],
    references: [categories.id],
  }),
  exchanges: many(barterExchanges),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  listing: one(marketplaceListings, {
    fields: [transactions.listingId],
    references: [marketplaceListings.id],
  }),
  seller: one(businesses, {
    relationName: "sellerTransactions",
    fields: [transactions.sellerBusinessId],
    references: [businesses.id],
  }),
  buyer: one(businesses, {
    relationName: "buyerTransactions",
    fields: [transactions.buyerBusinessId],
    references: [businesses.id],
  }),
}));

export const barterExchangesRelations = relations(barterExchanges, ({ one }) => ({
  listing: one(barterListings, {
    fields: [barterExchanges.listingId],
    references: [barterListings.id],
  }),
  initiator: one(businesses, {
    relationName: "initiatedBarterExchanges",
    fields: [barterExchanges.initiatorBusinessId],
    references: [businesses.id],
  }),
  responder: one(businesses, {
    relationName: "respondedBarterExchanges",
    fields: [barterExchanges.responderBusinessId],
    references: [businesses.id],
  }),
}));

// Create insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertBusinessSchema = createInsertSchema(businesses).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertMemberImportSchema = createInsertSchema(memberImports).omit({ id: true });
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true });
export const insertBarterListingSchema = createInsertSchema(barterListings).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertBarterExchangeSchema = createInsertSchema(barterExchanges).omit({ id: true });

// Type definitions
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertMemberImport = z.infer<typeof insertMemberImportSchema>;
export type MemberImport = typeof memberImports.$inferSelect;

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

export type InsertBarterListing = z.infer<typeof insertBarterListingSchema>;
export type BarterListing = typeof barterListings.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBarterExchange = z.infer<typeof insertBarterExchangeSchema>;
export type BarterExchange = typeof barterExchanges.$inferSelect;
