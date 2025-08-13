import {
  users,
  businesses,
  products,
  offers,
  categories,
  memberImports,
  cbaCauses,
  aiSummitRegistrations,
  aiSummitExhibitorRegistrations,
  aiSummitSpeakerInterests,
  aiSummitBadges,
  aiSummitCheckIns,
  aiSummitVolunteers,
  aiSummitTeamMembers,
  aiSummitWorkshops,
  aiSummitWorkshopRegistrations,
  aiSummitSpeakingSessions,
  aiSummitSessionRegistrations,
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
  type AISummitExhibitorRegistration,
  type InsertAISummitExhibitorRegistration,
  type AISummitSpeakerInterest,
  type InsertAISummitSpeakerInterest,
  type AISummitBadge,
  type InsertAISummitBadge,
  type AISummitCheckIn,
  type InsertAISummitCheckIn,
  type AISummitVolunteer,
  type InsertAISummitVolunteer,
  type AISummitTeamMember,
  type InsertAISummitTeamMember,
  type AISummitWorkshop,
  type InsertAISummitWorkshop,
  type AISummitWorkshopRegistration,
  type InsertAISummitWorkshopRegistration,
  type AISummitSpeakingSession,
  type InsertAISummitSpeakingSession,
  type AISummitSpeakingSessionRegistration,
  type InsertAISummitSpeakingSessionRegistration,
  contentReports,
  type ContentReport,
  type InsertContentReport,
  interactions,
  type Interaction,
  type InsertInteraction,
  passwordResetTokens,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  events,
  eventRegistrations,
  eventSessions,
  eventSessionRegistrations,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type EventSession,
  type InsertEventSession,
  type EventSessionRegistration,
  type InsertEventSessionRegistration,
  cbaEvents,
  cbaEventRegistrations,
  eventAttendanceAnalytics,
  personalBadgeEvents,
  ghlAutomationLogs,
  eventFeedback,
  eventScanners,
  scanHistory,
  scanSessions,
  type CBAEvent,
  type InsertCBAEvent,
  type CBAEventRegistration,
  type InsertCBAEventRegistration,
  type EventAttendanceAnalytics,
  type InsertEventAttendanceAnalytics,
  type PersonalBadgeEvent,
  type InsertPersonalBadgeEvent,
  type GHLAutomationLog,
  type InsertGHLAutomationLog,
  type EventFeedback,
  type InsertEventFeedback,
  type EventScanner,
  type InsertEventScanner,
  type ScanHistory,
  type InsertScanHistory,
  type ScanSession,
  type InsertScanSession,
  sponsorshipPackages,
  eventSponsors,
  type SponsorshipPackage,
  type InsertSponsorshipPackage,
  type EventSponsor,
  type InsertEventSponsor,
  personTypes,
  userPersonTypes,
  type PersonType,
  type InsertPersonType,
  type UserPersonType,
  type InsertUserPersonType,
  eventMoodEntries,
  eventMoodAggregations,
  type EventMoodEntry,
  type InsertEventMoodEntry,
  type EventMoodAggregation,
  type InsertEventMoodAggregation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, gte, lte, sql, gt, isNull, ilike, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  updateUserProfile(id: string, profileData: { firstName?: string; lastName?: string; phone?: string; company?: string; jobTitle?: string; bio?: string; isProfileHidden?: boolean }): Promise<User>;
  updateUserVerificationToken(id: string, token: string, expiry: Date): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  isUserAdmin(id: string): Promise<boolean>;
  getUserEventRegistrations(userId: string): Promise<any[]>;
  listUsers(options?: { search?: string; status?: string; limit?: number }): Promise<User[]>;
  suspendUser(userId: string, reason: string, suspendedBy: string): Promise<User>;
  reactivateUser(userId: string): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  
  // Business operations
  getBusinessById(id: number): Promise<Business | undefined>;
  getBusinessByUserId(userId: string): Promise<Business | undefined>;
  getBusinessByEmail(email: string): Promise<Business | undefined>;
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
  listActiveOffers(options?: { limit?: number, includePublic?: boolean, membersOnly?: boolean, includeMemberOnly?: boolean }): Promise<Offer[]>;
  
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
  createAISummitExhibitorRegistration(registration: InsertAISummitExhibitorRegistration): Promise<AISummitExhibitorRegistration>;
  createAISummitSpeakerInterest(interest: InsertAISummitSpeakerInterest): Promise<AISummitSpeakerInterest>;
  
  // Badge management operations
  createAISummitBadge(badge: InsertAISummitBadge): Promise<AISummitBadge>;
  getAISummitBadgeById(badgeId: string): Promise<AISummitBadge | undefined>;
  updateAISummitBadge(badgeId: string, updates: Partial<InsertAISummitBadge>): Promise<AISummitBadge>;
  getAllAISummitBadges(): Promise<AISummitBadge[]>;
  getBadgesByParticipantType(participantType: string): Promise<AISummitBadge[]>;
  getBadgesByEmail(email: string): Promise<AISummitBadge[]>;
  
  // Check-in operations
  createAISummitCheckIn(checkIn: InsertAISummitCheckIn): Promise<AISummitCheckIn>;
  getCheckInsByBadgeId(badgeId: string): Promise<AISummitCheckIn[]>;
  getAllAISummitCheckIns(): Promise<AISummitCheckIn[]>;
  
  // Volunteer operations
  createAISummitVolunteer(volunteer: InsertAISummitVolunteer): Promise<AISummitVolunteer>;
  getAISummitVolunteerById(id: number): Promise<AISummitVolunteer | undefined>;
  getAllAISummitVolunteers(): Promise<AISummitVolunteer[]>;
  
  // Team member operations
  createAISummitTeamMember(teamMember: InsertAISummitTeamMember): Promise<AISummitTeamMember>;
  getAISummitTeamMemberById(id: number): Promise<AISummitTeamMember | undefined>;
  getAllAISummitTeamMembers(): Promise<AISummitTeamMember[]>;

  // Workshop operations
  createAISummitWorkshop(workshop: InsertAISummitWorkshop): Promise<AISummitWorkshop>;
  getAISummitWorkshopById(id: number): Promise<AISummitWorkshop | undefined>;
  getAllAISummitWorkshops(): Promise<AISummitWorkshop[]>;
  updateAISummitWorkshop(id: number, workshop: Partial<InsertAISummitWorkshop>): Promise<AISummitWorkshop>;
  deleteAISummitWorkshop(id: number): Promise<boolean>;
  getActiveAISummitWorkshops(): Promise<AISummitWorkshop[]>;

  // Workshop registration operations
  createAISummitWorkshopRegistration(registration: InsertAISummitWorkshopRegistration): Promise<AISummitWorkshopRegistration>;
  getAISummitWorkshopRegistrationById(id: number): Promise<AISummitWorkshopRegistration | undefined>;
  getWorkshopRegistrationsByWorkshopId(workshopId: number): Promise<AISummitWorkshopRegistration[]>;
  getWorkshopRegistrationsByBadgeId(badgeId: string): Promise<AISummitWorkshopRegistration[]>;
  updateWorkshopRegistrationCheckIn(registrationId: number, checkedIn: boolean, checkedInAt?: Date): Promise<AISummitWorkshopRegistration>;
  checkWorkshopCapacity(workshopId: number): Promise<{ current: number; max: number; available: number }>;
  deleteAISummitWorkshopRegistration(id: number): Promise<boolean>;

  // Speaking session operations
  createAISummitSpeakingSession(session: InsertAISummitSpeakingSession): Promise<AISummitSpeakingSession>;
  getAISummitSpeakingSessionById(id: number): Promise<AISummitSpeakingSession | undefined>;
  getAllAISummitSpeakingSessions(): Promise<AISummitSpeakingSession[]>;
  updateAISummitSpeakingSession(id: number, session: Partial<InsertAISummitSpeakingSession>): Promise<AISummitSpeakingSession>;
  deleteAISummitSpeakingSession(id: number): Promise<boolean>;
  getActiveAISummitSpeakingSessions(): Promise<AISummitSpeakingSession[]>;

  // Speaking session registration operations
  createAISummitSpeakingSessionRegistration(registration: InsertAISummitSpeakingSessionRegistration): Promise<AISummitSpeakingSessionRegistration>;
  getAISummitSpeakingSessionRegistrationById(id: number): Promise<AISummitSpeakingSessionRegistration | undefined>;
  getSessionRegistrationsBySessionId(sessionId: number): Promise<AISummitSpeakingSessionRegistration[]>;
  getSessionRegistrationsByBadgeId(badgeId: string): Promise<AISummitSpeakingSessionRegistration[]>;
  checkSessionCapacity(sessionId: number): Promise<{ current: number; max: number; available: number }>;

  // General Event Management
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  getPublishedEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Event Registrations
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getEventRegistrationByTicketId(ticketId: string): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: number, registration: Partial<InsertEventRegistration>): Promise<EventRegistration>;
  deleteEventRegistration(id: number): Promise<void>;
  checkInEventRegistration(ticketId: string, checkedInBy: string): Promise<EventRegistration>;

  // Event Sessions
  getEventSessions(eventId: number): Promise<EventSession[]>;
  getEventSessionById(id: number): Promise<EventSession | undefined>;
  createEventSession(session: InsertEventSession): Promise<EventSession>;
  updateEventSession(id: number, session: Partial<InsertEventSession>): Promise<EventSession>;
  deleteEventSession(id: number): Promise<void>;

  // Event Session Registrations
  getEventSessionRegistrations(sessionId: number): Promise<EventSessionRegistration[]>;
  createEventSessionRegistration(registration: InsertEventSessionRegistration): Promise<EventSessionRegistration>;
  deleteEventSessionRegistration(sessionId: number, registrationId: number): Promise<void>;

  // Enhanced CBA Event Management operations
  createCBAEvent(event: InsertCBAEvent): Promise<CBAEvent>;
  getCBAEventById(id: number): Promise<CBAEvent | undefined>;
  getCBAEventBySlug(slug: string): Promise<CBAEvent | undefined>;
  getAllCBAEvents(): Promise<CBAEvent[]>;
  getActiveCBAEvents(): Promise<CBAEvent[]>;
  getFeaturedCBAEvents(): Promise<CBAEvent[]>;
  updateCBAEvent(id: number, event: Partial<InsertCBAEvent>): Promise<CBAEvent>;
  deleteCBAEvent(id: number): Promise<boolean>;
  getCBAEventsByType(eventType: string): Promise<CBAEvent[]>;
  getCBAEventsByDateRange(startDate: Date, endDate: Date): Promise<CBAEvent[]>;

  // CBA Event Registration operations
  createCBAEventRegistration(registration: InsertCBAEventRegistration): Promise<CBAEventRegistration>;
  getCBAEventRegistrationById(id: number): Promise<CBAEventRegistration | undefined>;
  getCBAEventRegistrationsByEventId(eventId: number): Promise<CBAEventRegistration[]>;
  getCBAEventRegistrationsByUserId(userId: string): Promise<CBAEventRegistration[]>;
  updateCBAEventRegistration(id: number, registration: Partial<InsertCBAEventRegistration>): Promise<CBAEventRegistration>;
  deleteCBAEventRegistration(id: number): Promise<boolean>;
  checkInCBAEventRegistration(registrationId: number, checkInTime?: Date): Promise<CBAEventRegistration>;
  checkOutCBAEventRegistration(registrationId: number, checkOutTime?: Date): Promise<CBAEventRegistration>;
  markCBAEventRegistrationNoShow(registrationId: number): Promise<CBAEventRegistration>;
  getCBAEventCapacity(eventId: number): Promise<{ current: number; max: number; available: number }>;

  // Event Attendance Analytics operations
  createEventAttendanceAnalytics(analytics: InsertEventAttendanceAnalytics): Promise<EventAttendanceAnalytics>;
  getEventAttendanceAnalyticsByUserId(userId: string): Promise<EventAttendanceAnalytics[]>;
  getEventAttendanceAnalyticsByEventId(eventId: number): Promise<EventAttendanceAnalytics[]>;
  updateEventAttendanceAnalytics(id: number, analytics: Partial<InsertEventAttendanceAnalytics>): Promise<EventAttendanceAnalytics>;
  getAttendancePatternsByUser(userEmail: string): Promise<EventAttendanceAnalytics[]>;
  getRegularAttendees(threshold?: number): Promise<EventAttendanceAnalytics[]>;
  getNoShowPatterns(threshold?: number): Promise<EventAttendanceAnalytics[]>;

  // Personal Badge Event Linking operations
  createPersonalBadgeEvent(badgeEvent: InsertPersonalBadgeEvent): Promise<PersonalBadgeEvent>;
  getPersonalBadgeEventById(id: number): Promise<PersonalBadgeEvent | undefined>;
  getPersonalBadgeEventsByBadgeId(badgeId: number): Promise<PersonalBadgeEvent[]>;
  getPersonalBadgeEventsByEventId(eventId: number): Promise<PersonalBadgeEvent[]>;
  updatePersonalBadgeEvent(id: number, badgeEvent: Partial<InsertPersonalBadgeEvent>): Promise<PersonalBadgeEvent>;
  deletePersonalBadgeEvent(id: number): Promise<boolean>;
  checkInPersonalBadgeEvent(id: number, checkInTime?: Date): Promise<PersonalBadgeEvent>;
  checkOutPersonalBadgeEvent(id: number, checkOutTime?: Date): Promise<PersonalBadgeEvent>;
  markBadgePrinted(id: number, printedTime?: Date): Promise<PersonalBadgeEvent>;

  // GoHighLevel Automation operations
  createGHLAutomationLog(log: InsertGHLAutomationLog): Promise<GHLAutomationLog>;
  getGHLAutomationLogById(id: number): Promise<GHLAutomationLog | undefined>;
  getGHLAutomationLogsByEventId(eventId: number): Promise<GHLAutomationLog[]>;
  getGHLAutomationLogsByUserId(userId: string): Promise<GHLAutomationLog[]>;
  updateGHLAutomationLog(id: number, log: Partial<InsertGHLAutomationLog>): Promise<GHLAutomationLog>;
  getFailedGHLAutomations(): Promise<GHLAutomationLog[]>;
  retryGHLAutomation(id: number): Promise<GHLAutomationLog>;

  // Event Feedback operations
  createEventFeedback(feedback: InsertEventFeedback): Promise<EventFeedback>;
  getEventFeedbackById(id: number): Promise<EventFeedback | undefined>;
  getEventFeedbackByEventId(eventId: number): Promise<EventFeedback[]>;
  getEventFeedbackByUserId(userId: string): Promise<EventFeedback[]>;
  updateEventFeedback(id: number, feedback: Partial<InsertEventFeedback>): Promise<EventFeedback>;
  deleteEventFeedback(id: number): Promise<boolean>;
  getEventRatingStats(eventId: number): Promise<{ averageRating: number; totalResponses: number; ratingBreakdown: any }>;
  getEventFeedbackSummary(eventId: number): Promise<{ ratings: any; comments: string[]; improvements: string[] }>;
  
  // Event scanning system operations
  // Scanner management
  createEventScanner(scanner: InsertEventScanner): Promise<EventScanner>;
  getEventScannersByEventId(eventId: number): Promise<EventScanner[]>;
  getEventScannersByUserId(userId: string): Promise<EventScanner[]>;
  updateEventScanner(id: number, scanner: Partial<InsertEventScanner>): Promise<EventScanner>;
  deactivateEventScanner(id: number): Promise<EventScanner>;
  
  // Scan history logging
  createScanRecord(scan: InsertScanHistory): Promise<ScanHistory>;
  getScanHistoryByEventId(eventId: number): Promise<ScanHistory[]>;
  getScanHistoryByScannerId(scannerId: string): Promise<ScanHistory[]>;
  getScanHistoryByScannedUserId(scannedUserId: string): Promise<ScanHistory[]>;
  getDuplicateScans(eventId: number, scannedUserId: string): Promise<ScanHistory[]>;
  getScanHistoryBetweenUsers(scannerId: string, scannedUserId: string): Promise<ScanHistory[]>;
  
  // Scan session management
  createScanSession(session: InsertScanSession): Promise<ScanSession>;
  getScanSessionsByScannerId(scannerId: string): Promise<ScanSession[]>;
  getActiveScanSession(scannerId: string, eventId: number): Promise<ScanSession | undefined>;
  endScanSession(sessionId: number, totalScans: number, uniqueScans: number, duplicateScans: number): Promise<ScanSession>;
  updateScanSession(id: number, session: Partial<InsertScanSession>): Promise<ScanSession>;
  
  // Scan analytics
  getScanAnalyticsByEvent(eventId: number): Promise<any>;
  getScanAnalyticsByScanner(scannerId: string): Promise<any>;
  getTopScanners(eventId?: number, limit?: number): Promise<any[]>;
  getMostScannedAttendees(eventId: number, limit?: number): Promise<any[]>;
  
  // Person Types operations
  listPersonTypes(): Promise<PersonType[]>;
  getPersonTypeById(id: number): Promise<PersonType | undefined>;
  createPersonType(personType: InsertPersonType): Promise<PersonType>;
  updatePersonType(id: number, personType: Partial<InsertPersonType>): Promise<PersonType>;
  deletePersonType(id: number): Promise<boolean>;
  
  // User Person Types operations
  getUserPersonTypes(userId: string): Promise<UserPersonType[]>;
  assignPersonTypeToUser(assignment: InsertUserPersonType): Promise<UserPersonType>;
  removePersonTypeFromUser(userId: string, personTypeId: number): Promise<boolean>;
  setPrimaryPersonType(userId: string, personTypeId: number): Promise<boolean>;
  getUsersByPersonType(personTypeId: number): Promise<User[]>;

  // Event Mood Sentiment operations
  createMoodEntry(entry: InsertEventMoodEntry): Promise<EventMoodEntry>;
  getMoodEntriesByEventId(eventId: number): Promise<EventMoodEntry[]>;
  getMoodEntriesBySession(eventId: number, sessionName: string): Promise<EventMoodEntry[]>;
  getMoodAggregationsByEventId(eventId: number): Promise<EventMoodAggregation[]>;
  updateMoodAggregation(eventId: number, sessionName: string | null, moodType: string, count: number, avgIntensity: number): Promise<void>;
  getRealTimeMoodData(eventId: number): Promise<{ entries: EventMoodEntry[]; aggregations: EventMoodAggregation[] }>;
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

  async createUser(userData: Partial<User>): Promise<User> {
    // Generate a unique ID if not provided
    const userId = userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
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

  async updateUserProfile(id: string, profileData: { firstName?: string; lastName?: string; phone?: string; company?: string; jobTitle?: string; bio?: string; isProfileHidden?: boolean }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...profileData, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserVerificationToken(id: string, token: string, expiry: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        verificationToken: token,
        verificationTokenExpiry: expiry,
        updatedAt: new Date() 
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

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete related records first to maintain referential integrity
      
      // Delete user_person_types entries
      await db.execute(sql`DELETE FROM user_person_types WHERE user_id = ${userId}`);
      
      // Delete AI Summit related records - using raw SQL for tables with user_id column
      await db.execute(sql`DELETE FROM ai_summit_registrations WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM ai_summit_exhibitor_registrations WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM ai_summit_volunteers WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM ai_summit_speaker_interests WHERE user_id = ${userId}`);
      
      // Delete check-ins first (they reference badges)
      await db.execute(sql`
        DELETE FROM ai_summit_check_ins 
        WHERE badge_id IN (
          SELECT badge_id FROM ai_summit_badges WHERE participant_id = ${userId}
        )
      `);
      
      // Then delete badges - uses participant_id instead of user_id
      await db.execute(sql`DELETE FROM ai_summit_badges WHERE participant_id = ${userId}`);
      
      // Delete other user-related records
      await db.execute(sql`DELETE FROM affiliates WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM affiliate_referrals WHERE referred_user_id = ${userId}`);
      await db.execute(sql`DELETE FROM cba_event_registrations WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM donations WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM event_registrations WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM event_scanners WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM event_feedback WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM event_mood_entries WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM event_attendance_analytics WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM ghl_automation_logs WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM interactions WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM job_applications WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM job_postings WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM job_saved_searches WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM personal_badges WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM scan_history WHERE scanned_user_id = ${userId}`);
      await db.execute(sql`DELETE FROM scan_history WHERE scanner_id = ${userId}`);
      await db.execute(sql`DELETE FROM scan_sessions WHERE scanner_id = ${userId}`);
      await db.execute(sql`DELETE FROM content_reports WHERE reporter_user_id = ${userId}`);
      
      // Delete user's business if exists
      const userBusiness = await this.getBusinessByUserId(userId);
      if (userBusiness) {
        await db.delete(businesses).where(eq(businesses.userId, userId));
      }
      
      // Finally delete the user
      const result = await db.delete(users).where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error; // Re-throw error instead of silently returning false
    }
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

  async getBusinessByEmail(email: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.email, email));
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
    let query = db
      .select({
        id: businesses.id,
        userId: businesses.userId,
        name: businesses.name,
        description: businesses.description,
        address: businesses.address,
        city: businesses.city,
        postcode: businesses.postcode,
        phone: businesses.phone,
        email: businesses.email,
        website: businesses.website,
        logo: businesses.logo,
        coverImage: businesses.coverImage,
        categoryId: businesses.categoryId,
        established: businesses.established,
        employeeCount: businesses.employeeCount,
        isVerified: businesses.isVerified,
        isActive: businesses.isActive,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt
      })
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id))
      .where(
        and(
          eq(businesses.isActive, true),
          or(
            isNull(users.isProfileHidden),
            eq(users.isProfileHidden, false)
          )
        )
      );
    
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

  async listActiveOffers(options?: { limit?: number, includePublic?: boolean, membersOnly?: boolean, includeMemberOnly?: boolean }): Promise<Offer[]> {
    let whereConditions = [
      eq(offers.isActive, true),
      or(
        sql`${offers.validUntil} IS NULL`,
        gte(offers.validUntil, new Date())
      ),
      or(
        sql`${offers.validFrom} IS NULL`,
        lte(offers.validFrom, new Date())
      )
    ];

    // Filter by visibility based on options
    if (options?.membersOnly) {
      whereConditions.push(eq(offers.memberOnlyDiscount, true));
    } else if (options?.includePublic && !options?.includeMemberOnly) {
      // For public API, exclude member-only offers unless specifically included
      whereConditions.push(eq(offers.memberOnlyDiscount, false));
    }

    let query = db.select().from(offers).where(and(...whereConditions));
    
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

  async createAISummitExhibitorRegistration(registrationData: InsertAISummitExhibitorRegistration): Promise<AISummitExhibitorRegistration> {
    const [registration] = await db
      .insert(aiSummitExhibitorRegistrations)
      .values(registrationData)
      .returning();
    return registration;
  }

  async createAISummitSpeakerInterest(interestData: InsertAISummitSpeakerInterest): Promise<AISummitSpeakerInterest> {
    const [interest] = await db
      .insert(aiSummitSpeakerInterests)
      .values(interestData)
      .returning();
    return interest;
  }

  // Badge management operations
  async createAISummitBadge(badgeData: InsertAISummitBadge): Promise<AISummitBadge> {
    const [badge] = await db
      .insert(aiSummitBadges)
      .values(badgeData)
      .returning();
    return badge;
  }

  async getAISummitBadgeById(badgeId: string): Promise<AISummitBadge | undefined> {
    const [badge] = await db
      .select()
      .from(aiSummitBadges)
      .where(eq(aiSummitBadges.badgeId, badgeId));
    return badge;
  }

  async updateAISummitBadge(badgeId: string, updates: Partial<InsertAISummitBadge>): Promise<AISummitBadge> {
    const [badge] = await db
      .update(aiSummitBadges)
      .set(updates)
      .where(eq(aiSummitBadges.badgeId, badgeId))
      .returning();
    return badge;
  }

  async getAllAISummitBadges(): Promise<AISummitBadge[]> {
    return await db.select().from(aiSummitBadges).orderBy(desc(aiSummitBadges.createdAt));
  }

  async getBadgesByParticipantType(participantType: string): Promise<AISummitBadge[]> {
    return await db
      .select()
      .from(aiSummitBadges)
      .where(eq(aiSummitBadges.participantType, participantType))
      .orderBy(desc(aiSummitBadges.createdAt));
  }

  async getBadgesByEmail(email: string): Promise<AISummitBadge[]> {
    return await db
      .select()
      .from(aiSummitBadges)
      .where(eq(aiSummitBadges.email, email))
      .orderBy(desc(aiSummitBadges.createdAt));
  }

  // Check-in operations
  async createAISummitCheckIn(checkInData: InsertAISummitCheckIn): Promise<AISummitCheckIn> {
    const [checkIn] = await db
      .insert(aiSummitCheckIns)
      .values(checkInData)
      .returning();
    return checkIn;
  }

  async getCheckInsByBadgeId(badgeId: string): Promise<AISummitCheckIn[]> {
    return await db
      .select()
      .from(aiSummitCheckIns)
      .where(eq(aiSummitCheckIns.badgeId, badgeId))
      .orderBy(desc(aiSummitCheckIns.checkInTime));
  }

  async getAllAISummitCheckIns(): Promise<AISummitCheckIn[]> {
    return await db.select().from(aiSummitCheckIns).orderBy(desc(aiSummitCheckIns.checkInTime));
  }

  // Volunteer operations
  async createAISummitVolunteer(volunteerData: InsertAISummitVolunteer): Promise<AISummitVolunteer> {
    const [volunteer] = await db
      .insert(aiSummitVolunteers)
      .values(volunteerData)
      .returning();
    return volunteer;
  }

  async getAISummitVolunteerById(id: number): Promise<AISummitVolunteer | undefined> {
    const [volunteer] = await db
      .select()
      .from(aiSummitVolunteers)
      .where(eq(aiSummitVolunteers.id, id));
    return volunteer;
  }

  async getAllAISummitVolunteers(): Promise<AISummitVolunteer[]> {
    return await db.select().from(aiSummitVolunteers).orderBy(desc(aiSummitVolunteers.registeredAt));
  }

  // Team member operations
  async createAISummitTeamMember(teamMemberData: InsertAISummitTeamMember): Promise<AISummitTeamMember> {
    const [teamMember] = await db
      .insert(aiSummitTeamMembers)
      .values(teamMemberData)
      .returning();
    return teamMember;
  }

  async getAISummitTeamMemberById(id: number): Promise<AISummitTeamMember | undefined> {
    const [teamMember] = await db
      .select()
      .from(aiSummitTeamMembers)
      .where(eq(aiSummitTeamMembers.id, id));
    return teamMember;
  }

  async getAllAISummitTeamMembers(): Promise<AISummitTeamMember[]> {
    return await db.select().from(aiSummitTeamMembers).orderBy(desc(aiSummitTeamMembers.createdAt));
  }

  // Workshop operations
  async createAISummitWorkshop(workshopData: InsertAISummitWorkshop): Promise<AISummitWorkshop> {
    const [workshop] = await db
      .insert(aiSummitWorkshops)
      .values(workshopData)
      .returning();
    return workshop;
  }

  async getAISummitWorkshopById(id: number): Promise<AISummitWorkshop | undefined> {
    const [workshop] = await db
      .select()
      .from(aiSummitWorkshops)
      .where(eq(aiSummitWorkshops.id, id));
    return workshop;
  }

  async getAllAISummitWorkshops(): Promise<AISummitWorkshop[]> {
    return await db.select().from(aiSummitWorkshops).orderBy(aiSummitWorkshops.startTime);
  }

  async updateAISummitWorkshop(id: number, workshopData: Partial<InsertAISummitWorkshop>): Promise<AISummitWorkshop> {
    const [workshop] = await db
      .update(aiSummitWorkshops)
      .set(workshopData)
      .where(eq(aiSummitWorkshops.id, id))
      .returning();
    return workshop;
  }

  async deleteAISummitWorkshop(id: number): Promise<boolean> {
    const result = await db
      .delete(aiSummitWorkshops)
      .where(eq(aiSummitWorkshops.id, id))
      .returning();
    return result.length > 0;
  }

  async getActiveAISummitWorkshops(): Promise<AISummitWorkshop[]> {
    return await db
      .select()
      .from(aiSummitWorkshops)
      .where(eq(aiSummitWorkshops.isActive, true))
      .orderBy(aiSummitWorkshops.startTime);
  }

  // Workshop registration operations
  async createAISummitWorkshopRegistration(registrationData: InsertAISummitWorkshopRegistration): Promise<AISummitWorkshopRegistration> {
    const [registration] = await db
      .insert(aiSummitWorkshopRegistrations)
      .values(registrationData)
      .returning();
    return registration;
  }

  async getAISummitWorkshopRegistrationById(id: number): Promise<AISummitWorkshopRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(aiSummitWorkshopRegistrations)
      .where(eq(aiSummitWorkshopRegistrations.id, id));
    return registration;
  }

  async getWorkshopRegistrationsByWorkshopId(workshopId: number): Promise<AISummitWorkshopRegistration[]> {
    return await db
      .select()
      .from(aiSummitWorkshopRegistrations)
      .where(eq(aiSummitWorkshopRegistrations.workshopId, workshopId))
      .orderBy(aiSummitWorkshopRegistrations.registeredAt);
  }

  async getWorkshopRegistrationsByBadgeId(badgeId: string): Promise<AISummitWorkshopRegistration[]> {
    return await db
      .select()
      .from(aiSummitWorkshopRegistrations)
      .where(eq(aiSummitWorkshopRegistrations.badgeId, badgeId))
      .orderBy(aiSummitWorkshopRegistrations.registeredAt);
  }

  async updateWorkshopRegistrationCheckIn(registrationId: number, checkedIn: boolean, checkedInAt?: Date): Promise<AISummitWorkshopRegistration> {
    const [registration] = await db
      .update(aiSummitWorkshopRegistrations)
      .set({
        checkedIn,
        checkedInAt: checkedInAt || new Date()
      })
      .where(eq(aiSummitWorkshopRegistrations.id, registrationId))
      .returning();
    return registration;
  }

  async checkWorkshopCapacity(workshopId: number): Promise<{ current: number; max: number; available: number }> {
    const workshop = await this.getAISummitWorkshopById(workshopId);
    if (!workshop) {
      throw new Error(`Workshop with id ${workshopId} not found`);
    }

    const registrations = await this.getWorkshopRegistrationsByWorkshopId(workshopId);
    const current = registrations.length;
    const max = workshop.maxCapacity;
    const available = max - current;

    return { current, max, available };
  }

  async deleteAISummitWorkshopRegistration(id: number): Promise<boolean> {
    const result = await db
      .delete(aiSummitWorkshopRegistrations)
      .where(eq(aiSummitWorkshopRegistrations.id, id))
      .returning();
    return result.length > 0;
  }

  // Speaking session operations
  async createAISummitSpeakingSession(sessionData: InsertAISummitSpeakingSession): Promise<AISummitSpeakingSession> {
    const [session] = await db
      .insert(aiSummitSpeakingSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getAISummitSpeakingSessionById(id: number): Promise<AISummitSpeakingSession | undefined> {
    const [session] = await db
      .select()
      .from(aiSummitSpeakingSessions)
      .where(eq(aiSummitSpeakingSessions.id, id));
    return session;
  }

  async getAllAISummitSpeakingSessions(): Promise<AISummitSpeakingSession[]> {
    return await db.select().from(aiSummitSpeakingSessions).orderBy(aiSummitSpeakingSessions.startTime);
  }

  async updateAISummitSpeakingSession(id: number, sessionData: Partial<InsertAISummitSpeakingSession>): Promise<AISummitSpeakingSession> {
    const [session] = await db
      .update(aiSummitSpeakingSessions)
      .set(sessionData)
      .where(eq(aiSummitSpeakingSessions.id, id))
      .returning();
    return session;
  }

  async deleteAISummitSpeakingSession(id: number): Promise<boolean> {
    const result = await db
      .delete(aiSummitSpeakingSessions)
      .where(eq(aiSummitSpeakingSessions.id, id))
      .returning();
    return result.length > 0;
  }

  async getActiveAISummitSpeakingSessions(): Promise<AISummitSpeakingSession[]> {
    return await db
      .select()
      .from(aiSummitSpeakingSessions)
      .where(eq(aiSummitSpeakingSessions.isActive, true))
      .orderBy(aiSummitSpeakingSessions.startTime);
  }

  // Speaking session registration operations
  async createAISummitSpeakingSessionRegistration(registrationData: InsertAISummitSpeakingSessionRegistration): Promise<AISummitSpeakingSessionRegistration> {
    const [registration] = await db
      .insert(aiSummitSessionRegistrations)
      .values(registrationData)
      .returning();
    return registration;
  }

  async getAISummitSpeakingSessionRegistrationById(id: number): Promise<AISummitSpeakingSessionRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(aiSummitSessionRegistrations)
      .where(eq(aiSummitSessionRegistrations.id, id));
    return registration;
  }

  async getSessionRegistrationsBySessionId(sessionId: number): Promise<AISummitSpeakingSessionRegistration[]> {
    return await db
      .select()
      .from(aiSummitSessionRegistrations)
      .where(eq(aiSummitSessionRegistrations.sessionId, sessionId))
      .orderBy(aiSummitSessionRegistrations.registeredAt);
  }

  async getSessionRegistrationsByBadgeId(badgeId: string): Promise<AISummitSpeakingSessionRegistration[]> {
    return await db
      .select()
      .from(aiSummitSessionRegistrations)
      .where(eq(aiSummitSessionRegistrations.badgeId, badgeId))
      .orderBy(aiSummitSessionRegistrations.registeredAt);
  }

  async checkSessionCapacity(sessionId: number): Promise<{ current: number; max: number; available: number }> {
    const session = await this.getAISummitSpeakingSessionById(sessionId);
    if (!session) {
      throw new Error(`Speaking session with id ${sessionId} not found`);
    }

    const registrations = await this.getSessionRegistrationsBySessionId(sessionId);
    const current = registrations.length;
    const max = session.maxCapacity;
    const available = max - current;

    return { current, max, available };
  }

  // Real-time occupancy tracking methods
  async getCurrentOccupancy(): Promise<{ 
    totalInBuilding: number; 
    totalCheckedIn: number; 
    totalCheckedOut: number; 
    lastUpdated: Date 
  }> {
    // Get the latest check-in record for each badge
    const latestCheckIns = await db
      .selectDistinct({
        badgeId: aiSummitCheckIns.badgeId,
        checkInType: aiSummitCheckIns.checkInType,
        timestamp: aiSummitCheckIns.timestamp,
      })
      .from(aiSummitCheckIns)
      .innerJoin(
        db.select({
          badgeId: aiSummitCheckIns.badgeId,
          maxTimestamp: sql<Date>`MAX(${aiSummitCheckIns.timestamp})`.as('maxTimestamp'),
        })
        .from(aiSummitCheckIns)
        .groupBy(aiSummitCheckIns.badgeId)
        .as('latest'),
        sql`${aiSummitCheckIns.badgeId} = latest.badge_id AND ${aiSummitCheckIns.timestamp} = latest.max_timestamp`
      );

    const checkedInCount = latestCheckIns.filter(record => record.checkInType === 'check_in').length;
    const checkedOutCount = latestCheckIns.filter(record => record.checkInType === 'check_out').length;
    
    return {
      totalInBuilding: checkedInCount,
      totalCheckedIn: latestCheckIns.filter(record => record.checkInType === 'check_in').length,
      totalCheckedOut: latestCheckIns.filter(record => record.checkInType === 'check_out').length,
      lastUpdated: new Date(),
    };
  }

  async getDetailedOccupancy(): Promise<{
    byParticipantType: Record<string, { checkedIn: number; checkedOut: number }>;
    totalInBuilding: number;
    recentActivity: Array<{
      badgeId: string;
      name: string;
      participantType: string;
      checkInType: string;
      timestamp: Date;
      staffMember?: string;
    }>;
  }> {
    // Get latest status for each badge with participant details
    const latestStatusWithDetails = await db
      .select({
        badgeId: aiSummitCheckIns.badgeId,
        checkInType: aiSummitCheckIns.checkInType,
        timestamp: aiSummitCheckIns.timestamp,
        staffMember: aiSummitCheckIns.staffMember,
        name: aiSummitBadges.name,
        participantType: aiSummitBadges.participantType,
      })
      .from(aiSummitCheckIns)
      .innerJoin(aiSummitBadges, eq(aiSummitCheckIns.badgeId, aiSummitBadges.badgeId))
      .innerJoin(
        db.select({
          badgeId: aiSummitCheckIns.badgeId,
          maxTimestamp: sql<Date>`MAX(${aiSummitCheckIns.timestamp})`.as('maxTimestamp'),
        })
        .from(aiSummitCheckIns)
        .groupBy(aiSummitCheckIns.badgeId)
        .as('latest'),
        sql`${aiSummitCheckIns.badgeId} = latest.badge_id AND ${aiSummitCheckIns.timestamp} = latest.max_timestamp`
      )
      .orderBy(desc(aiSummitCheckIns.timestamp));

    // Group by participant type
    const byParticipantType: Record<string, { checkedIn: number; checkedOut: number }> = {};
    let totalInBuilding = 0;

    latestStatusWithDetails.forEach(record => {
      if (!byParticipantType[record.participantType]) {
        byParticipantType[record.participantType] = { checkedIn: 0, checkedOut: 0 };
      }

      if (record.checkInType === 'check_in') {
        byParticipantType[record.participantType].checkedIn++;
        totalInBuilding++;
      } else {
        byParticipantType[record.participantType].checkedOut++;
      }
    });

    // Get recent activity (last 50 records)
    const recentActivity = await db
      .select({
        badgeId: aiSummitCheckIns.badgeId,
        name: aiSummitBadges.name,
        participantType: aiSummitBadges.participantType,
        checkInType: aiSummitCheckIns.checkInType,
        timestamp: aiSummitCheckIns.timestamp,
        staffMember: aiSummitCheckIns.staffMember,
      })
      .from(aiSummitCheckIns)
      .innerJoin(aiSummitBadges, eq(aiSummitCheckIns.badgeId, aiSummitBadges.badgeId))
      .orderBy(desc(aiSummitCheckIns.timestamp))
      .limit(50);

    return {
      byParticipantType,
      totalInBuilding,
      recentActivity,
    };
  }

  async getOccupancyHistory(hours: number = 24): Promise<Array<{
    timestamp: Date;
    totalInBuilding: number;
    checkedInCount: number;
    checkedOutCount: number;
  }>> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get check-in activity grouped by hour
    const hourlyActivity = await db
      .select({
        hour: sql<string>`DATE_TRUNC('hour', ${aiSummitCheckIns.timestamp})`.as('hour'),
        checkInType: aiSummitCheckIns.checkInType,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(aiSummitCheckIns)
      .where(sql`${aiSummitCheckIns.timestamp} >= ${hoursAgo}`)
      .groupBy(sql`DATE_TRUNC('hour', ${aiSummitCheckIns.timestamp})`, aiSummitCheckIns.checkInType)
      .orderBy(sql`DATE_TRUNC('hour', ${aiSummitCheckIns.timestamp})`);

    // Process into hourly totals
    const historyMap = new Map<string, { 
      timestamp: Date; 
      checkedInCount: number; 
      checkedOutCount: number; 
    }>();

    hourlyActivity.forEach(record => {
      const hourKey = record.hour;
      if (!historyMap.has(hourKey)) {
        historyMap.set(hourKey, {
          timestamp: new Date(record.hour),
          checkedInCount: 0,
          checkedOutCount: 0,
        });
      }

      const entry = historyMap.get(hourKey)!;
      if (record.checkInType === 'check_in') {
        entry.checkedInCount = record.count;
      } else {
        entry.checkedOutCount = record.count;
      }
    });

    // Calculate running total in building for each hour
    const history = Array.from(historyMap.values()).map(entry => ({
      ...entry,
      totalInBuilding: entry.checkedInCount - entry.checkedOutCount,
    }));

    return history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getUserEventRegistrations(userId: string): Promise<any[]> {
    const registrations = [];

    // Get attendee registrations with badges
    const attendees = await db
      .select({
        registration: aiSummitRegistrations,
        badge: aiSummitBadges
      })
      .from(aiSummitRegistrations)
      .leftJoin(aiSummitBadges, eq(aiSummitRegistrations.id, sql`CAST(${aiSummitBadges.participantId} AS INTEGER)`))
      .where(eq(aiSummitRegistrations.userId, userId));

    for (const { registration, badge } of attendees) {
      registrations.push({
        eventName: "First AI Summit Croydon 2025",
        participantType: "Attendee", 
        eventDate: "October 1st, 2025",
        eventTime: "10:00 AM - 4:00 PM",
        venue: "LSBU London South Bank University Croydon",
        registrationType: "attendee",
        badgeId: badge?.badgeId,
        registrationData: registration
      });
    }

    // Get exhibitor registrations with badges
    const exhibitors = await db
      .select({
        registration: aiSummitExhibitorRegistrations,
        badge: aiSummitBadges
      })
      .from(aiSummitExhibitorRegistrations)
      .leftJoin(aiSummitBadges, eq(aiSummitExhibitorRegistrations.id, sql`CAST(${aiSummitBadges.participantId} AS INTEGER)`))
      .where(eq(aiSummitExhibitorRegistrations.userId, userId));

    for (const { registration, badge } of exhibitors) {
      registrations.push({
        eventName: "First AI Summit Croydon 2025",
        participantType: registration.speakerInterest ? "Exhibitor & Speaker" : "Exhibitor",
        eventDate: "October 1st, 2025",
        eventTime: "10:00 AM - 4:00 PM",
        venue: "LSBU London South Bank University Croydon",
        registrationType: "exhibitor",
        badgeId: badge?.badgeId,
        registrationData: registration
      });
    }

    // Get volunteer registrations with badges
    const volunteers = await db
      .select({
        registration: aiSummitVolunteers,
        badge: aiSummitBadges
      })
      .from(aiSummitVolunteers)
      .leftJoin(aiSummitBadges, eq(aiSummitVolunteers.id, sql`CAST(${aiSummitBadges.participantId} AS INTEGER)`))
      .where(eq(aiSummitVolunteers.userId, userId));

    for (const { registration, badge } of volunteers) {
      registrations.push({
        eventName: "First AI Summit Croydon 2025",
        participantType: "Volunteer",
        eventDate: "October 1st, 2025",
        eventTime: "9:00 AM - 5:00 PM",
        venue: "LSBU London South Bank University Croydon",
        registrationType: "volunteer",
        badgeId: badge?.badgeId,
        registrationData: registration
      });
    }

    return registrations;
  }

  // General Event Management Implementation
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getPublishedEvents(): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.status, 'published'))
      .orderBy(desc(events.startDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Event Registrations Implementation
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.registrationDate));
  }

  async getEventRegistrationByTicketId(ticketId: string): Promise<EventRegistration | undefined> {
    const [registration] = await db.select().from(eventRegistrations)
      .where(eq(eventRegistrations.ticketId, ticketId));
    return registration;
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db.insert(eventRegistrations).values(registration).returning();
    return newRegistration;
  }

  async updateEventRegistration(id: number, registration: Partial<InsertEventRegistration>): Promise<EventRegistration> {
    const [updatedRegistration] = await db
      .update(eventRegistrations)
      .set(registration)
      .where(eq(eventRegistrations.id, id))
      .returning();
    return updatedRegistration;
  }

  async deleteEventRegistration(id: number): Promise<void> {
    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
  }

  async checkInEventRegistration(ticketId: string, checkedInBy: string): Promise<EventRegistration> {
    const [updatedRegistration] = await db
      .update(eventRegistrations)
      .set({ 
        status: 'checked_in',
        checkedInAt: new Date(),
        checkedInBy 
      })
      .where(eq(eventRegistrations.ticketId, ticketId))
      .returning();
    return updatedRegistration;
  }

  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId))
      .orderBy(desc(eventRegistrations.registrationDate));
  }

  // Event Sessions Implementation
  async getEventSessions(eventId: number): Promise<EventSession[]> {
    return await db.select().from(eventSessions)
      .where(eq(eventSessions.eventId, eventId))
      .orderBy(eventSessions.startTime);
  }

  async getEventSessionById(id: number): Promise<EventSession | undefined> {
    const [session] = await db.select().from(eventSessions).where(eq(eventSessions.id, id));
    return session;
  }

  async createEventSession(session: InsertEventSession): Promise<EventSession> {
    const [newSession] = await db.insert(eventSessions).values(session).returning();
    return newSession;
  }

  async updateEventSession(id: number, session: Partial<InsertEventSession>): Promise<EventSession> {
    const [updatedSession] = await db
      .update(eventSessions)
      .set(session)
      .where(eq(eventSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteEventSession(id: number): Promise<void> {
    await db.delete(eventSessions).where(eq(eventSessions.id, id));
  }

  // Event Session Registrations Implementation
  async getEventSessionRegistrations(sessionId: number): Promise<EventSessionRegistration[]> {
    return await db.select().from(eventSessionRegistrations)
      .where(eq(eventSessionRegistrations.sessionId, sessionId))
      .orderBy(desc(eventSessionRegistrations.registeredAt));
  }

  async createEventSessionRegistration(registration: InsertEventSessionRegistration): Promise<EventSessionRegistration> {
    const [newRegistration] = await db.insert(eventSessionRegistrations).values(registration).returning();
    return newRegistration;
  }

  async deleteEventSessionRegistration(sessionId: number, registrationId: number): Promise<void> {
    await db.delete(eventSessionRegistrations)
      .where(
        and(
          eq(eventSessionRegistrations.sessionId, sessionId),
          eq(eventSessionRegistrations.registrationId, registrationId)
        )
      );
  }

  // Event Scanning System Implementation
  // Scanner management
  async createEventScanner(scanner: InsertEventScanner): Promise<EventScanner> {
    const [newScanner] = await db.insert(eventScanners).values(scanner).returning();
    return newScanner;
  }

  async getEventScannersByEventId(eventId: number): Promise<EventScanner[]> {
    return await db.select().from(eventScanners)
      .where(and(eq(eventScanners.eventId, eventId), eq(eventScanners.isActive, true)))
      .orderBy(desc(eventScanners.assignedAt));
  }

  async getEventScannersByUserId(userId: string): Promise<EventScanner[]> {
    return await db.select().from(eventScanners)
      .where(and(eq(eventScanners.userId, userId), eq(eventScanners.isActive, true)))
      .orderBy(desc(eventScanners.assignedAt));
  }

  async updateEventScanner(id: number, scanner: Partial<InsertEventScanner>): Promise<EventScanner> {
    const [updatedScanner] = await db
      .update(eventScanners)
      .set(scanner)
      .where(eq(eventScanners.id, id))
      .returning();
    return updatedScanner;
  }

  async deactivateEventScanner(id: number): Promise<EventScanner> {
    const [deactivatedScanner] = await db
      .update(eventScanners)
      .set({ isActive: false })
      .where(eq(eventScanners.id, id))
      .returning();
    return deactivatedScanner;
  }

  // Scan history logging
  async createScanRecord(scan: InsertScanHistory): Promise<ScanHistory> {
    // Check for duplicate scans within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentScans = await db.select().from(scanHistory)
      .where(
        and(
          eq(scanHistory.scannerId, scan.scannerId),
          eq(scanHistory.scannedUserId, scan.scannedUserId),
          scan.eventId ? eq(scanHistory.eventId, scan.eventId) : undefined,
          gte(scanHistory.scanTimestamp, fiveMinutesAgo)
        )
      );

    const isDuplicate = recentScans.length > 0;

    const [newScan] = await db.insert(scanHistory).values({
      ...scan,
      duplicateScanFlag: isDuplicate
    }).returning();

    // Update scanner's total scans
    if (scan.eventId) {
      await db
        .update(eventScanners)
        .set({ 
          totalScansCompleted: sql`${eventScanners.totalScansCompleted} + 1`
        })
        .where(
          and(
            eq(eventScanners.userId, scan.scannerId),
            eq(eventScanners.eventId, scan.eventId)
          )
        );
    }

    return newScan;
  }

  async getScanHistoryByEventId(eventId: number): Promise<ScanHistory[]> {
    return await db.select().from(scanHistory)
      .where(eq(scanHistory.eventId, eventId))
      .orderBy(desc(scanHistory.scanTimestamp));
  }

  async getScanHistoryByScannerId(scannerId: string): Promise<ScanHistory[]> {
    return await db.select().from(scanHistory)
      .where(eq(scanHistory.scannerId, scannerId))
      .orderBy(desc(scanHistory.scanTimestamp));
  }

  async getScanHistoryByScannedUserId(scannedUserId: string): Promise<ScanHistory[]> {
    return await db.select().from(scanHistory)
      .where(eq(scanHistory.scannedUserId, scannedUserId))
      .orderBy(desc(scanHistory.scanTimestamp));
  }

  async getDuplicateScans(eventId: number, scannedUserId: string): Promise<ScanHistory[]> {
    return await db.select().from(scanHistory)
      .where(
        and(
          eq(scanHistory.eventId, eventId),
          eq(scanHistory.scannedUserId, scannedUserId),
          eq(scanHistory.duplicateScanFlag, true)
        )
      )
      .orderBy(desc(scanHistory.scanTimestamp));
  }

  async getScanHistoryBetweenUsers(scannerId: string, scannedUserId: string): Promise<ScanHistory[]> {
    return await db.select().from(scanHistory)
      .where(
        and(
          eq(scanHistory.scannerId, scannerId),
          eq(scanHistory.scannedUserId, scannedUserId)
        )
      )
      .orderBy(desc(scanHistory.scanTimestamp));
  }

  // Scan session management
  async createScanSession(session: InsertScanSession): Promise<ScanSession> {
    const [newSession] = await db.insert(scanSessions).values(session).returning();
    return newSession;
  }

  async getScanSessionsByScannerId(scannerId: string): Promise<ScanSession[]> {
    return await db.select().from(scanSessions)
      .where(eq(scanSessions.scannerId, scannerId))
      .orderBy(desc(scanSessions.sessionStart));
  }

  async getActiveScanSession(scannerId: string, eventId: number): Promise<ScanSession | undefined> {
    const [session] = await db.select().from(scanSessions)
      .where(
        and(
          eq(scanSessions.scannerId, scannerId),
          eq(scanSessions.eventId, eventId),
          isNull(scanSessions.sessionEnd)
        )
      )
      .orderBy(desc(scanSessions.sessionStart));
    return session;
  }

  async endScanSession(sessionId: number, totalScans: number, uniqueScans: number, duplicateScans: number): Promise<ScanSession> {
    const [updatedSession] = await db
      .update(scanSessions)
      .set({
        sessionEnd: new Date(),
        totalScans,
        uniqueScans,
        duplicateScans
      })
      .where(eq(scanSessions.id, sessionId))
      .returning();
    return updatedSession;
  }

  async updateScanSession(id: number, session: Partial<InsertScanSession>): Promise<ScanSession> {
    const [updatedSession] = await db
      .update(scanSessions)
      .set(session)
      .where(eq(scanSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Scan analytics
  async getScanAnalyticsByEvent(eventId: number): Promise<any> {
    const analytics = await db
      .select({
        totalScans: sql<number>`count(*)`,
        uniqueScannedUsers: sql<number>`count(distinct ${scanHistory.scannedUserId})`,
        totalScanners: sql<number>`count(distinct ${scanHistory.scannerId})`,
        duplicateScans: sql<number>`count(*) filter (where ${scanHistory.duplicateScanFlag} = true)`,
        checkIns: sql<number>`count(*) filter (where ${scanHistory.scanType} = 'check_in')`,
        checkOuts: sql<number>`count(*) filter (where ${scanHistory.scanType} = 'check_out')`,
        verifications: sql<number>`count(*) filter (where ${scanHistory.scanType} = 'verification')`,
        networking: sql<number>`count(*) filter (where ${scanHistory.scanType} = 'networking')`
      })
      .from(scanHistory)
      .where(eq(scanHistory.eventId, eventId));

    return analytics[0];
  }

  async getScanAnalyticsByScanner(scannerId: string): Promise<any> {
    const analytics = await db
      .select({
        totalScans: sql<number>`count(*)`,
        uniqueScannedUsers: sql<number>`count(distinct ${scanHistory.scannedUserId})`,
        duplicateScans: sql<number>`count(*) filter (where ${scanHistory.duplicateScanFlag} = true)`,
        sessionsCount: sql<number>`(select count(*) from ${scanSessions} where ${scanSessions.scannerId} = ${scannerId})`,
        avgScansPerSession: sql<number>`(select avg(${scanSessions.totalScans}) from ${scanSessions} where ${scanSessions.scannerId} = ${scannerId})`
      })
      .from(scanHistory)
      .where(eq(scanHistory.scannerId, scannerId));

    return analytics[0];
  }

  async getTopScanners(eventId?: number, limit: number = 10): Promise<any[]> {
    let query = db
      .select({
        scannerId: scanHistory.scannerId,
        totalScans: sql<number>`count(*)`,
        uniqueScannedUsers: sql<number>`count(distinct ${scanHistory.scannedUserId})`,
        duplicateScans: sql<number>`count(*) filter (where ${scanHistory.duplicateScanFlag} = true)`
      })
      .from(scanHistory)
      .groupBy(scanHistory.scannerId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    if (eventId) {
      query = query.where(eq(scanHistory.eventId, eventId));
    }

    return await query;
  }

  async getMostScannedAttendees(eventId: number, limit: number = 10): Promise<any[]> {
    return await db
      .select({
        scannedUserId: scanHistory.scannedUserId,
        totalScans: sql<number>`count(*)`,
        uniqueScanners: sql<number>`count(distinct ${scanHistory.scannerId})`,
        lastScannedAt: sql<Date>`max(${scanHistory.scanTimestamp})`
      })
      .from(scanHistory)
      .where(eq(scanHistory.eventId, eventId))
      .groupBy(scanHistory.scannedUserId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  }

  // Person Types operations
  async listPersonTypes(): Promise<PersonType[]> {
    return await db
      .select()
      .from(personTypes)
      .where(eq(personTypes.isActive, true))
      .orderBy(asc(personTypes.priority), asc(personTypes.name));
  }

  async getPersonTypeById(id: number): Promise<PersonType | undefined> {
    const [personType] = await db
      .select()
      .from(personTypes)
      .where(eq(personTypes.id, id));
    return personType;
  }

  async createPersonType(personType: InsertPersonType): Promise<PersonType> {
    const [newPersonType] = await db
      .insert(personTypes)
      .values(personType)
      .returning();
    return newPersonType;
  }

  async updatePersonType(id: number, personType: Partial<InsertPersonType>): Promise<PersonType> {
    const [updatedPersonType] = await db
      .update(personTypes)
      .set({
        ...personType,
        updatedAt: new Date()
      })
      .where(eq(personTypes.id, id))
      .returning();
    return updatedPersonType;
  }

  async deletePersonType(id: number): Promise<boolean> {
    const result = await db
      .update(personTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(personTypes.id, id))
      .returning();
    return result.length > 0;
  }

  // User Person Types operations
  async getUserPersonTypes(userId: string): Promise<UserPersonType[]> {
    return await db
      .select()
      .from(userPersonTypes)
      .where(eq(userPersonTypes.userId, userId))
      .orderBy(desc(userPersonTypes.isPrimary), asc(userPersonTypes.assignedAt));
  }

  async assignPersonTypeToUser(assignment: InsertUserPersonType): Promise<UserPersonType> {
    const [userPersonType] = await db
      .insert(userPersonTypes)
      .values(assignment)
      .onConflictDoNothing()
      .returning();
    return userPersonType;
  }

  async removePersonTypeFromUser(userId: string, personTypeId: number): Promise<boolean> {
    const result = await db
      .delete(userPersonTypes)
      .where(
        and(
          eq(userPersonTypes.userId, userId),
          eq(userPersonTypes.personTypeId, personTypeId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async setPrimaryPersonType(userId: string, personTypeId: number): Promise<boolean> {
    // First, set all user's person types to non-primary
    await db
      .update(userPersonTypes)
      .set({ isPrimary: false })
      .where(eq(userPersonTypes.userId, userId));
    
    // Then set the specified one as primary
    const result = await db
      .update(userPersonTypes)
      .set({ isPrimary: true })
      .where(
        and(
          eq(userPersonTypes.userId, userId),
          eq(userPersonTypes.personTypeId, personTypeId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async getUsersByPersonType(personTypeId: number): Promise<User[]> {
    const userIds = await db
      .select({ userId: userPersonTypes.userId })
      .from(userPersonTypes)
      .where(eq(userPersonTypes.personTypeId, personTypeId));
    
    if (userIds.length === 0) return [];
    
    return await db
      .select()
      .from(users)
      .where(
        or(
          ...userIds.map(u => eq(users.id, u.userId))
        )
      );
  }

  // Event Mood Sentiment operations
  async createMoodEntry(entry: InsertEventMoodEntry): Promise<EventMoodEntry> {
    const [moodEntry] = await db
      .insert(eventMoodEntries)
      .values({
        ...entry,
        createdAt: new Date(),
      })
      .returning();

    // Update aggregations after creating entry
    if (entry.eventId && entry.moodType) {
      await this.updateMoodAggregation(
        entry.eventId, 
        entry.sessionName || null, 
        entry.moodType, 
        1, 
        entry.intensity || 5
      );
    }

    return moodEntry;
  }

  async getMoodEntriesByEventId(eventId: number): Promise<EventMoodEntry[]> {
    return await db
      .select()
      .from(eventMoodEntries)
      .where(eq(eventMoodEntries.eventId, eventId))
      .orderBy(desc(eventMoodEntries.createdAt));
  }

  async getMoodEntriesBySession(eventId: number, sessionName: string): Promise<EventMoodEntry[]> {
    return await db
      .select()
      .from(eventMoodEntries)
      .where(
        and(
          eq(eventMoodEntries.eventId, eventId),
          eq(eventMoodEntries.sessionName, sessionName)
        )
      )
      .orderBy(desc(eventMoodEntries.createdAt));
  }

  async getMoodAggregationsByEventId(eventId: number): Promise<EventMoodAggregation[]> {
    return await db
      .select()
      .from(eventMoodAggregations)
      .where(eq(eventMoodAggregations.eventId, eventId))
      .orderBy(desc(eventMoodAggregations.lastUpdated));
  }

  async updateMoodAggregation(eventId: number, sessionName: string | null, moodType: string, count: number, avgIntensity: number): Promise<void> {
    const whereClause = sessionName 
      ? and(
          eq(eventMoodAggregations.eventId, eventId),
          eq(eventMoodAggregations.sessionName, sessionName),
          eq(eventMoodAggregations.moodType, moodType)
        )
      : and(
          eq(eventMoodAggregations.eventId, eventId),
          isNull(eventMoodAggregations.sessionName),
          eq(eventMoodAggregations.moodType, moodType)
        );

    // Check if aggregation exists
    const [existing] = await db
      .select()
      .from(eventMoodAggregations)
      .where(whereClause);

    if (existing) {
      // Update existing aggregation
      const newCount = existing.totalCount + count;
      const newAvgIntensity = ((existing.averageIntensity * existing.totalCount) + (avgIntensity * count)) / newCount;
      
      await db
        .update(eventMoodAggregations)
        .set({
          totalCount: newCount,
          averageIntensity: newAvgIntensity.toFixed(2),
          lastUpdated: new Date(),
        })
        .where(whereClause);
    } else {
      // Create new aggregation
      await db
        .insert(eventMoodAggregations)
        .values({
          eventId,
          sessionName,
          moodType,
          totalCount: count,
          averageIntensity: avgIntensity.toFixed(2),
          lastUpdated: new Date(),
        });
    }
  }

  async getRealTimeMoodData(eventId: number): Promise<{ entries: EventMoodEntry[]; aggregations: EventMoodAggregation[] }> {
    const [entries, aggregations] = await Promise.all([
      this.getMoodEntriesByEventId(eventId),
      this.getMoodAggregationsByEventId(eventId)
    ]);

    return { entries, aggregations };
  }
}

export const storage = new DatabaseStorage();
