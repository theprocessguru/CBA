import {
  users,
  businesses,
  products,
  offers,
  categories,
  memberImports,
  cbaCauses,
  aiSummitRegistrations,
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
  type CbaCause,
  type AISummitRegistration,
  type InsertAISummitRegistration,
  contentReports,
  type ContentReport,
  type InsertContentReport,
  interactions,
  type Interaction,
  type InsertInteraction,
  passwordResetTokens,
  type PasswordResetToken,
  type InsertPasswordResetToken,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, gte, lte, sql, gt, isNull, ilike, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  isUserAdmin(id: string): Promise<boolean>;
  listUsers(options?: { search?: string; status?: string; limit?: number }): Promise<User[]>;
  suspendUser(userId: string, reason: string, suspendedBy: string): Promise<User>;
  reactivateUser(userId: string): Promise<User>;
  
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
  
  // CBA Causes operations
  listCbaCauses(): Promise<CbaCause[]>;
  
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
  
  // Content report operations
  createContentReport(report: InsertContentReport): Promise<ContentReport>;
  getContentReportById(id: number): Promise<ContentReport | undefined>;
  getContentReportsByStatus(status?: string): Promise<ContentReport[]>;
  updateContentReport(id: number, report: Partial<InsertContentReport>): Promise<ContentReport>;
  getContentReportsForContent(contentType: string, contentId: number): Promise<ContentReport[]>;
  
  // Interaction tracking operations
  recordInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getInteractionStats(contentType?: string, timeframe?: string): Promise<any>;
  getOfferEngagementStats(): Promise<any>;
  getBusinessProfileViews(businessId: number): Promise<number>;
  getTopViewedContent(contentType: string, limit?: number): Promise<any[]>;
  
  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: number): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
  
  // AI Summit registration operations
  createAISummitRegistration(registration: InsertAISummitRegistration): Promise<AISummitRegistration>;
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

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
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

  async listUsers(options?: { search?: string; status?: string; limit?: number }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (options?.search) {
      query = query.where(
        or(
          like(users.email, `%${options.search}%`),
          like(users.firstName, `%${options.search}%`),
          like(users.lastName, `%${options.search}%`)
        )
      );
    }
    
    if (options?.status && options.status !== 'all') {
      query = query.where(eq(users.accountStatus, options.status));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  async suspendUser(userId: string, reason: string, suspendedBy: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        accountStatus: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy: suspendedBy,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async reactivateUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        accountStatus: 'active',
        suspensionReason: null,
        suspendedAt: null,
        suspendedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
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

  // CBA Causes operations
  async listCbaCauses(): Promise<CbaCause[]> {
    return await db.select().from(cbaCauses).orderBy(cbaCauses.name);
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
  
  // Content report operations
  async createContentReport(report: InsertContentReport): Promise<ContentReport> {
    const [contentReport] = await db
      .insert(contentReports)
      .values(report)
      .returning();
    return contentReport;
  }

  async getContentReportById(id: number): Promise<ContentReport | undefined> {
    const [report] = await db.select().from(contentReports).where(eq(contentReports.id, id));
    return report;
  }

  async getContentReportsByStatus(status?: string): Promise<ContentReport[]> {
    if (status) {
      return await db.select().from(contentReports).where(eq(contentReports.status, status));
    }
    return await db.select().from(contentReports);
  }

  async updateContentReport(id: number, report: Partial<InsertContentReport>): Promise<ContentReport> {
    const [updatedReport] = await db
      .update(contentReports)
      .set(report)
      .where(eq(contentReports.id, id))
      .returning();
    return updatedReport;
  }

  async getContentReportsForContent(contentType: string, contentId: number): Promise<ContentReport[]> {
    return await db
      .select()
      .from(contentReports)
      .where(
        and(
          eq(contentReports.contentType, contentType),
          eq(contentReports.contentId, contentId)
        )
      );
  }
  
  // Interaction tracking operations
  async recordInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const [newInteraction] = await db
      .insert(interactions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async getInteractionStats(contentType?: string, timeframe?: string): Promise<any> {
    let query = db
      .select({
        contentType: interactions.contentType,
        contentId: interactions.contentId,
        interactionType: interactions.interactionType,
        count: sql<number>`count(*)::int`
      })
      .from(interactions);
    
    const conditions = [];
    
    if (contentType) {
      conditions.push(eq(interactions.contentType, contentType));
    }
    
    if (timeframe) {
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      conditions.push(gte(interactions.createdAt, startDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .groupBy(interactions.contentType, interactions.contentId, interactions.interactionType)
      .orderBy(desc(sql`count(*)`));
  }

  async getOfferEngagementStats(): Promise<any> {
    return await db
      .select({
        offerId: interactions.contentId,
        views: sql<number>`count(case when ${interactions.interactionType} = 'view' then 1 end)::int`,
        clicks: sql<number>`count(case when ${interactions.interactionType} = 'click' then 1 end)::int`,
        contacts: sql<number>`count(case when ${interactions.interactionType} = 'contact' then 1 end)::int`,
        uniqueUsers: sql<number>`count(distinct ${interactions.userId})::int`
      })
      .from(interactions)
      .where(eq(interactions.contentType, 'offer'))
      .groupBy(interactions.contentId)
      .orderBy(desc(sql`count(*)`));
  }

  async getBusinessProfileViews(businessId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(interactions)
      .where(
        and(
          eq(interactions.contentType, 'business'),
          eq(interactions.contentId, businessId),
          eq(interactions.interactionType, 'view')
        )
      );
    
    return result[0]?.count || 0;
  }

  async getTopViewedContent(contentType: string, limit: number = 10): Promise<any[]> {
    return await db
      .select({
        contentId: interactions.contentId,
        views: sql<number>`count(*)::int`,
        uniqueViews: sql<number>`count(distinct ${interactions.userId})::int`
      })
      .from(interactions)
      .where(
        and(
          eq(interactions.contentType, contentType),
          eq(interactions.interactionType, 'view')
        )
      )
      .groupBy(interactions.contentId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  }
  
  // Password reset operations
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db
      .insert(passwordResetTokens)
      .values(tokenData)
      .returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      );
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  // Membership management operations
  async getMembershipStats(): Promise<any> {
    const totalMembers = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const activeMembers = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.membershipStatus, 'active'));
    const trialMembers = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.isTrialMember, true));
    
    const tierDistribution = await db
      .select({
        tier: users.membershipTier,
        count: sql<number>`count(*)::int`
      })
      .from(users)
      .groupBy(users.membershipTier);
    
    const tierDistributionMap: Record<string, number> = {};
    tierDistribution.forEach(row => {
      if (row.tier) {
        tierDistributionMap[row.tier] = row.count;
      }
    });

    return {
      totalMembers: totalMembers[0]?.count || 0,
      activeMembers: activeMembers[0]?.count || 0,
      trialMembers: trialMembers[0]?.count || 0,
      tierDistribution: tierDistributionMap,
      revenueThisMonth: 0, // TODO: Calculate from subscription data
      revenueThisYear: 0   // TODO: Calculate from subscription data
    };
  }

  async getMembers(filters?: { search?: string; status?: string; tier?: string }): Promise<any[]> {
    let query = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      membershipTier: users.membershipTier,
      membershipStatus: users.membershipStatus,
      membershipStartDate: users.membershipStartDate,
      membershipEndDate: users.membershipEndDate,
      isTrialMember: users.isTrialMember,
      createdAt: users.createdAt
    }).from(users);

    const conditions = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(users.email, `%${filters.search}%`),
          ilike(users.firstName, `%${filters.search}%`),
          ilike(users.lastName, `%${filters.search}%`)
        )
      );
    }

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(users.membershipStatus, filters.status));
    }

    if (filters?.tier && filters.tier !== 'all') {
      conditions.push(eq(users.membershipTier, filters.tier));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(users.createdAt));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lte(passwordResetTokens.expiresAt, new Date()));
  }

  // AI Summit registration operations
  async createAISummitRegistration(registrationData: InsertAISummitRegistration): Promise<AISummitRegistration> {
    const [registration] = await db
      .insert(aiSummitRegistrations)
      .values(registrationData)
      .returning();
    return registration;
  }
}

export const storage = new DatabaseStorage();
