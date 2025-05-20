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
}));

// Create insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertBusinessSchema = createInsertSchema(businesses).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertMemberImportSchema = createInsertSchema(memberImports).omit({ id: true });

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
