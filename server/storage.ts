import {
  users,
  businesses,
  products,
  offers,
  categories,
  memberImports,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type Product,
  type InsertProduct,
  type Offer,
  type InsertOffer,
  type Category,
  type InsertCategory,
  type MemberImport,
  type InsertMemberImport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  isUserAdmin(id: string): Promise<boolean>;
  
  // Business operations
  getBusinessById(id: number): Promise<Business | undefined>;
  getBusinessByUserId(userId: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business>;
  listBusinesses(options?: { categoryId?: number, search?: string, limit?: number }): Promise<Business[]>;
  
  // Product operations
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByBusinessId(businessId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  listProducts(options?: { categoryId?: number, search?: string, isService?: boolean, isPublic?: boolean, limit?: number }): Promise<Product[]>;
  
  // Offer operations
  getOfferById(id: number): Promise<Offer | undefined>;
  getOffersByBusinessId(businessId: number): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer>;
  deleteOffer(id: number): Promise<boolean>;
  listActiveOffers(options?: { limit?: number }): Promise<Offer[]>;
  
  // Category operations
  getCategoryById(id: number): Promise<Category | undefined>;
  listCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Member Import operations
  createMemberImport(memberImport: InsertMemberImport): Promise<MemberImport>;
  updateMemberImport(id: number, memberImport: Partial<InsertMemberImport>): Promise<MemberImport>;
  getMemberImportsByAdminId(adminId: string): Promise<MemberImport[]>;
  
  // Marketplace listings operations
  getMarketplaceListingById(id: number): Promise<MarketplaceListing | undefined>;
  getMarketplaceListingsByBusinessId(businessId: number): Promise<MarketplaceListing[]>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: number, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing>;
  deleteMarketplaceListing(id: number): Promise<boolean>;
  listMarketplaceListings(options?: { categoryId?: number, search?: string, limit?: number }): Promise<MarketplaceListing[]>;
  
  // Barter listings operations
  getBarterListingById(id: number): Promise<BarterListing | undefined>;
  getBarterListingsByBusinessId(businessId: number): Promise<BarterListing[]>;
  createBarterListing(listing: InsertBarterListing): Promise<BarterListing>;
  updateBarterListing(id: number, listing: Partial<InsertBarterListing>): Promise<BarterListing>;
  deleteBarterListing(id: number): Promise<boolean>;
  listBarterListings(options?: { categoryId?: number, search?: string, limit?: number }): Promise<BarterListing[]>;
  
  // Transaction operations
  getTransactionById(id: string): Promise<Transaction | undefined>;
  getTransactionsByBusinessId(businessId: number, role?: 'seller' | 'buyer'): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  
  // Barter exchange operations
  getBarterExchangeById(id: string): Promise<BarterExchange | undefined>;
  getBarterExchangesByBusinessId(businessId: number, role?: 'initiator' | 'responder'): Promise<BarterExchange[]>;
  createBarterExchange(exchange: InsertBarterExchange): Promise<BarterExchange>;
  updateBarterExchange(id: string, exchange: Partial<InsertBarterExchange>): Promise<BarterExchange>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async isUserAdmin(id: string): Promise<boolean> {
    const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, id));
    return !!user?.isAdmin;
  }

  // Business operations
  async getBusinessById(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async getBusinessByUserId(userId: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.userId, userId));
    return business;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set({ ...business, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  async listBusinesses(options?: { categoryId?: number; search?: string; limit?: number }): Promise<Business[]> {
    let query = db.select().from(businesses).where(eq(businesses.isActive, true));
    
    if (options?.categoryId) {
      query = query.where(eq(businesses.categoryId, options.categoryId));
    }
    
    if (options?.search) {
      query = query.where(
        or(
          like(businesses.name, `%${options.search}%`),
          like(businesses.description, `%${options.search}%`)
        )
      );
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    query = query.orderBy(desc(businesses.createdAt));
    
    return await query;
  }

  // Product operations
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByBusinessId(businessId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.businessId, businessId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return result.length > 0;
  }

  async listProducts(options?: { categoryId?: number; search?: string; isService?: boolean; isPublic?: boolean; limit?: number }): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (options?.categoryId) {
      query = query.where(eq(products.categoryId, options.categoryId));
    }
    
    if (options?.search) {
      query = query.where(
        or(
          like(products.name, `%${options.search}%`),
          like(products.description, `%${options.search}%`)
        )
      );
    }
    
    if (options?.isService !== undefined) {
      query = query.where(eq(products.isService, options.isService));
    }
    
    if (options?.isPublic !== undefined) {
      query = query.where(eq(products.isPublic, options.isPublic));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    query = query.orderBy(desc(products.createdAt));
    
    return await query;
  }

  // Offer operations
  async getOfferById(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }

  async getOffersByBusinessId(businessId: number): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.businessId, businessId));
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer> {
    const [updatedOffer] = await db
      .update(offers)
      .set({ ...offer, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning();
    return updatedOffer;
  }

  async deleteOffer(id: number): Promise<boolean> {
    const result = await db.delete(offers).where(eq(offers.id, id)).returning({ id: offers.id });
    return result.length > 0;
  }

  async listActiveOffers(options?: { limit?: number }): Promise<Offer[]> {
    let query = db.select().from(offers).where(
      and(
        eq(offers.isActive, true),
        or(
          sql`${offers.validUntil} IS NULL`,
          gte(offers.validUntil, new Date())
        ),
        or(
          sql`${offers.validFrom} IS NULL`,
          lte(offers.validFrom, new Date())
        )
      )
    );
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    query = query.orderBy(desc(offers.createdAt));
    
    return await query;
  }

  // Category operations
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async listCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Member Import operations
  async createMemberImport(memberImport: InsertMemberImport): Promise<MemberImport> {
    const [newMemberImport] = await db.insert(memberImports).values(memberImport).returning();
    return newMemberImport;
  }

  async updateMemberImport(id: number, memberImport: Partial<InsertMemberImport>): Promise<MemberImport> {
    const [updatedMemberImport] = await db
      .update(memberImports)
      .set({ ...memberImport, updatedAt: new Date() })
      .where(eq(memberImports.id, id))
      .returning();
    return updatedMemberImport;
  }

  async getMemberImportsByAdminId(adminId: string): Promise<MemberImport[]> {
    return await db
      .select()
      .from(memberImports)
      .where(eq(memberImports.adminId, adminId))
      .orderBy(desc(memberImports.createdAt));
  }
}

export const storage = new DatabaseStorage();
