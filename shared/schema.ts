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
  numeric,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

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

// User table for local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"), // For local authentication
  isAdmin: boolean("is_admin").default(false),
  membershipTier: varchar("membership_tier").default("Starter Tier"), // Starter Tier, Growth Tier, Strategic Tier, Patron Tier, Partner
  membershipStatus: varchar("membership_status").default("trial"), // trial, active, suspended, expired
  membershipStartDate: timestamp("membership_start_date").defaultNow(),
  membershipEndDate: timestamp("membership_end_date"),
  isTrialMember: boolean("is_trial_member").default(true),
  trialDonationPaid: boolean("trial_donation_paid").default(false),
  donationAmount: decimal("donation_amount", { precision: 10, scale: 2 }),
  donationDate: timestamp("donation_date"),
  accountStatus: varchar("account_status").notNull().default("active"), // active, suspended, closed
  suspensionReason: text("suspension_reason"),
  suspendedAt: timestamp("suspended_at"),
  suspendedBy: varchar("suspended_by").references(() => users.id),
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
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // Original price for members to see savings
  memberOnlyDiscount: boolean("member_only_discount").default(false), // True if this is a member-only offer
  memberDiscountPercentage: integer("member_discount_percentage"), // Additional discount for members
  memberDiscountValue: decimal("member_discount_value", { precision: 10, scale: 2 }), // Fixed discount for members
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

// CBA causes and donations
export const cbaCauses = pgTable("cba_causes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }),
  raisedAmount: decimal("raised_amount", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  causeId: integer("cause_id").notNull().references(() => cbaCauses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  isTrialDonation: boolean("is_trial_donation").default(false),
  donationDate: timestamp("donation_date").defaultNow(),
  status: varchar("status").default("completed"), // pending, completed, failed, refunded
});

// Content reports table
export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  reporterUserId: varchar("reporter_user_id").notNull().references(() => users.id),
  contentType: varchar("content_type").notNull(), // 'business', 'product', 'offer', 'marketplace_listing', 'barter_listing'
  contentId: integer("content_id").notNull(),
  reason: varchar("reason").notNull(), // 'inappropriate', 'spam', 'misleading', 'offensive', 'other'
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // pending, reviewed, resolved, dismissed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Interaction tracking table
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // null for anonymous views
  contentType: varchar("content_type").notNull(), // 'business', 'product', 'offer', 'marketplace_listing'
  contentId: integer("content_id").notNull(),
  interactionType: varchar("interaction_type").notNull(), // 'view', 'click', 'contact', 'phone_click', 'email_click', 'website_click'
  metadata: text("metadata"), // JSON string for additional data
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Summit registrations table
export const aiSummitRegistrations = pgTable("ai_summit_registrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to user account
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  phoneNumber: varchar("phone_number"),
  businessType: varchar("business_type"),
  aiInterest: varchar("ai_interest"),
  accessibilityNeeds: varchar("accessibility_needs"),
  comments: text("comments"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// AI Summit exhibitor registrations table
export const aiSummitExhibitorRegistrations = pgTable("ai_summit_exhibitor_registrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to user account
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  businessDescription: text("business_description"),
  productsServices: text("products_services"),
  exhibitionGoals: text("exhibition_goals"),
  boothRequirements: varchar("booth_requirements"), // Standard, Premium, Custom
  electricalNeeds: boolean("electrical_needs").default(false),
  internetNeeds: boolean("internet_needs").default(false),
  specialRequirements: text("special_requirements"),
  marketingMaterials: text("marketing_materials"),
  numberOfAttendees: integer("number_of_attendees").default(2),
  previousExhibitor: boolean("previous_exhibitor").default(false),
  referralSource: varchar("referral_source"),
  agreesToTerms: boolean("agrees_to_terms").default(false),
  attendees: text("attendees"), // JSON string containing attendee details
  registeredAt: timestamp("registered_at").defaultNow(),
});

// AI Summit speaker interests table
export const aiSummitSpeakerInterests = pgTable("ai_summit_speaker_interests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to user account
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  website: varchar("website"),
  linkedIn: varchar("linked_in"),
  bio: text("bio"),
  talkTitle: varchar("talk_title"),
  talkDescription: text("talk_description"),
  talkDuration: varchar("talk_duration"),
  audienceLevel: varchar("audience_level"),
  speakingExperience: text("speaking_experience"),
  previousSpeaking: boolean("previous_speaking").default(false),
  techRequirements: text("tech_requirements"),
  availableSlots: text("available_slots"), // JSON string
  motivationToSpeak: text("motivation_to_speak"),
  keyTakeaways: text("key_takeaways"),
  interactiveElements: boolean("interactive_elements").default(false),
  handoutsProvided: boolean("handouts_provided").default(false),
  agreesToTerms: boolean("agrees_to_terms").default(false),
  source: varchar("source"), // Track source of registration (direct, exhibitor_registration, etc.)
  registeredAt: timestamp("registered_at").defaultNow(),
});

// AI Summit badges table
export const aiSummitBadges = pgTable("ai_summit_badges", {
  id: serial("id").primaryKey(),
  badgeId: varchar("badge_id").notNull().unique(), // Unique identifier for QR code
  participantType: varchar("participant_type").notNull(), // attendee, exhibitor, speaker, volunteer, team
  participantId: varchar("participant_id").notNull(), // Reference to the registration ID
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  badgeDesign: varchar("badge_design").default("standard"), // standard, vip, speaker, volunteer, team
  qrCodeData: text("qr_code_data").notNull(), // JSON string with encoded badge info
  printableBadgeHTML: text("printable_badge_html"), // HTML for A4 printing
  isActive: boolean("is_active").default(true),
  printedAt: timestamp("printed_at"),
  issuedAt: timestamp("issued_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Summit check-ins table for tracking entry/exit
export const aiSummitCheckIns = pgTable("ai_summit_check_ins", {
  id: serial("id").primaryKey(),
  badgeId: varchar("badge_id").notNull().references(() => aiSummitBadges.badgeId),
  checkInType: varchar("check_in_type").notNull(), // check_in, check_out
  checkInTime: timestamp("check_in_time").defaultNow(),
  checkInLocation: varchar("check_in_location").default("main_entrance"), // main_entrance, exhibition_hall, conference_room
  checkInMethod: varchar("check_in_method").default("qr_scan"), // qr_scan, manual_entry
  notes: text("notes"),
  staffMember: varchar("staff_member"), // Who processed the check-in
});

// AI Summit volunteers table
export const aiSummitVolunteers = pgTable("ai_summit_volunteers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to user account
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  role: varchar("role").notNull(), // registration_desk, information, technical_support, logistics, security
  shift: varchar("shift"), // morning, afternoon, full_day
  experience: text("experience"),
  availability: text("availability"),
  emergencyContact: varchar("emergency_contact"),
  t_shirtSize: varchar("t_shirt_size"),
  dietaryRequirements: text("dietary_requirements"),
  agreesToTerms: boolean("agrees_to_terms").default(false),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// AI Summit team members table
export const aiSummitTeamMembers = pgTable("ai_summit_team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  role: varchar("role").notNull(), // organizer, coordinator, technical_lead, marketing, finance, logistics
  department: varchar("department"), // events, marketing, technical, finance, operations
  accessLevel: varchar("access_level").default("standard"), // standard, admin, super_admin
  permissions: text("permissions"), // JSON string of specific permissions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Summit workshop sessions table
export const aiSummitWorkshops = pgTable("ai_summit_workshops", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  facilitator: varchar("facilitator").notNull(), // Speaker/facilitator name
  facilitatorBio: text("facilitator_bio"),
  facilitatorCompany: varchar("facilitator_company"),
  duration: integer("duration").notNull(), // Duration in minutes
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  room: varchar("room").notNull(), // Room name/number
  maxCapacity: integer("max_capacity").notNull(),
  currentRegistrations: integer("current_registrations").default(0),
  category: varchar("category").notNull(), // beginner, intermediate, advanced, business, technical
  tags: text("tags"), // JSON array of tags
  prerequisites: text("prerequisites"),
  learningObjectives: text("learning_objectives"),
  materials: text("materials"), // What attendees should bring or will receive
  isActive: boolean("is_active").default(true),
  registrationDeadline: timestamp("registration_deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Summit workshop registrations table
export const aiSummitWorkshopRegistrations = pgTable("ai_summit_workshop_registrations", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").notNull().references(() => aiSummitWorkshops.id),
  badgeId: varchar("badge_id").notNull().references(() => aiSummitBadges.badgeId),
  attendeeName: varchar("attendee_name").notNull(),
  attendeeEmail: varchar("attendee_email").notNull(),
  attendeeCompany: varchar("attendee_company"),
  attendeeJobTitle: varchar("attendee_job_title"),
  experienceLevel: varchar("experience_level"), // beginner, intermediate, advanced
  specificInterests: text("specific_interests"), // What they hope to learn
  dietaryRequirements: text("dietary_requirements"),
  accessibilityNeeds: text("accessibility_needs"),
  registrationSource: varchar("registration_source").default("direct"), // direct, badge_holder, exhibitor
  registeredAt: timestamp("registered_at").defaultNow(),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  noShow: boolean("no_show").default(false),
}, (table) => [
  // Prevent duplicate registrations for same workshop
  primaryKey(table.workshopId, table.badgeId)
]);

// AI Summit speaking sessions table (different from speaker interests - these are confirmed sessions)
export const aiSummitSpeakingSessions = pgTable("ai_summit_speaking_sessions", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  speakerName: varchar("speaker_name").notNull(),
  speakerBio: text("speaker_bio"),
  speakerCompany: varchar("speaker_company"),
  speakerJobTitle: varchar("speaker_job_title"),
  coSpeakers: text("co_speakers"), // JSON array for multiple speakers
  sessionType: varchar("session_type").notNull(), // keynote, panel, presentation, demo, fireside_chat
  duration: integer("duration").notNull(), // Duration in minutes
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  venue: varchar("venue").notNull(), // Main stage, conference room, etc.
  maxCapacity: integer("max_capacity").notNull(),
  currentRegistrations: integer("current_registrations").default(0),
  audienceLevel: varchar("audience_level").notNull(), // all, beginner, intermediate, advanced, business_leaders
  topics: text("topics"), // JSON array of topic tags
  keyTakeaways: text("key_takeaways"),
  isLiveStreamed: boolean("is_live_streamed").default(false),
  isRecorded: boolean("is_recorded").default(false),
  requiresRegistration: boolean("requires_registration").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Summit speaking session registrations table
export const aiSummitSessionRegistrations = pgTable("ai_summit_session_registrations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => aiSummitSpeakingSessions.id),
  badgeId: varchar("badge_id").notNull().references(() => aiSummitBadges.badgeId),
  attendeeName: varchar("attendee_name").notNull(),
  attendeeEmail: varchar("attendee_email").notNull(),
  attendeeCompany: varchar("attendee_company"),
  attendeeJobTitle: varchar("attendee_job_title"),
  specificInterests: text("specific_interests"), // What they hope to learn from this session
  questionsForSpeaker: text("questions_for_speaker"),
  registrationSource: varchar("registration_source").default("direct"), // direct, badge_holder, exhibitor
  registeredAt: timestamp("registered_at").defaultNow(),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  noShow: boolean("no_show").default(false),
}, (table) => [
  // Prevent duplicate registrations for same session
  primaryKey(table.sessionId, table.badgeId)
]);



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
export const insertCbaCauseSchema = createInsertSchema(cbaCauses).omit({ id: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true });
export const insertContentReportSchema = createInsertSchema(contentReports).omit({ id: true });
export const insertInteractionSchema = createInsertSchema(interactions).omit({ id: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true });
export const insertAISummitRegistrationSchema = createInsertSchema(aiSummitRegistrations).omit({ id: true });
export const insertAISummitExhibitorRegistrationSchema = createInsertSchema(aiSummitExhibitorRegistrations).omit({ id: true });
export const insertAISummitSpeakerInterestSchema = createInsertSchema(aiSummitSpeakerInterests).omit({ id: true });
export const insertAISummitBadgeSchema = createInsertSchema(aiSummitBadges).omit({ id: true });
export const insertAISummitCheckInSchema = createInsertSchema(aiSummitCheckIns).omit({ id: true });
export const insertAISummitVolunteerSchema = createInsertSchema(aiSummitVolunteers).omit({ id: true });
export const insertAISummitTeamMemberSchema = createInsertSchema(aiSummitTeamMembers).omit({ id: true });
export const insertAISummitWorkshopSchema = createInsertSchema(aiSummitWorkshops).omit({ id: true });
export const insertAISummitWorkshopRegistrationSchema = createInsertSchema(aiSummitWorkshopRegistrations).omit({ id: true });
export const insertAISummitSpeakingSessionSchema = createInsertSchema(aiSummitSpeakingSessions).omit({ id: true });
export const insertAISummitSpeakingSessionRegistrationSchema = createInsertSchema(aiSummitSessionRegistrations).omit({ id: true });

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

export type InsertCbaCause = z.infer<typeof insertCbaCauseSchema>;
export type CbaCause = typeof cbaCauses.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type ContentReport = typeof contentReports.$inferSelect;

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type InsertAISummitRegistration = z.infer<typeof insertAISummitRegistrationSchema>;
export type AISummitRegistration = typeof aiSummitRegistrations.$inferSelect;

export type InsertAISummitExhibitorRegistration = z.infer<typeof insertAISummitExhibitorRegistrationSchema>;
export type AISummitExhibitorRegistration = typeof aiSummitExhibitorRegistrations.$inferSelect;

export type InsertAISummitSpeakerInterest = z.infer<typeof insertAISummitSpeakerInterestSchema>;
export type AISummitSpeakerInterest = typeof aiSummitSpeakerInterests.$inferSelect;

export type InsertAISummitBadge = z.infer<typeof insertAISummitBadgeSchema>;
export type AISummitBadge = typeof aiSummitBadges.$inferSelect;

export type InsertAISummitCheckIn = z.infer<typeof insertAISummitCheckInSchema>;
export type AISummitCheckIn = typeof aiSummitCheckIns.$inferSelect;

export type InsertAISummitVolunteer = z.infer<typeof insertAISummitVolunteerSchema>;
export type AISummitVolunteer = typeof aiSummitVolunteers.$inferSelect;

export type InsertAISummitTeamMember = z.infer<typeof insertAISummitTeamMemberSchema>;
export type AISummitTeamMember = typeof aiSummitTeamMembers.$inferSelect;

export type InsertAISummitWorkshop = z.infer<typeof insertAISummitWorkshopSchema>;
export type AISummitWorkshop = typeof aiSummitWorkshops.$inferSelect;

export type InsertAISummitWorkshopRegistration = z.infer<typeof insertAISummitWorkshopRegistrationSchema>;
export type AISummitWorkshopRegistration = typeof aiSummitWorkshopRegistrations.$inferSelect;

export type InsertAISummitSpeakingSession = z.infer<typeof insertAISummitSpeakingSessionSchema>;
export type AISummitSpeakingSession = typeof aiSummitSpeakingSessions.$inferSelect;

export type InsertAISummitSpeakingSessionRegistration = z.infer<typeof insertAISummitSpeakingSessionRegistrationSchema>;
export type AISummitSpeakingSessionRegistration = typeof aiSummitSessionRegistrations.$inferSelect;

// General Event Management System
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  registrationFee: numeric("registration_fee", { precision: 10, scale: 2 }).default('0'),
  status: varchar("status", { length: 20 }).default('draft'), // draft, published, cancelled, completed
  eventType: varchar("event_type", { length: 50 }).notNull(), // workshop, seminar, conference, networking, etc.
  tags: text("tags").array(), // Array of category tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("events_start_date_idx").on(table.startDate),
  index("events_status_idx").on(table.status),
  index("events_type_idx").on(table.eventType),
]);

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  ticketId: varchar("ticket_id", { length: 50 }).notNull().unique(), // Generated ticket ID
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  dietaryRequirements: text("dietary_requirements"),
  accessibilityNeeds: text("accessibility_needs"),
  status: varchar("status", { length: 20 }).default('confirmed'), // confirmed, waitlist, cancelled, checked_in
  registrationDate: timestamp("registration_date").defaultNow(),
  qrCode: text("qr_code"), // Base64 encoded QR code
  additionalData: jsonb("additional_data"), // Flexible field for event-specific data
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: varchar("checked_in_by", { length: 255 }),
}, (table) => [
  index("event_registrations_event_idx").on(table.eventId),
  index("event_registrations_email_idx").on(table.email),
  index("event_registrations_status_idx").on(table.status),
  unique("unique_event_email").on(table.eventId, table.email),
]);

export const eventSessions = pgTable("event_sessions", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  speakerName: varchar("speaker_name", { length: 255 }),
  speakerBio: text("speaker_bio"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  room: varchar("room", { length: 100 }),
  maxCapacity: integer("max_capacity"),
  sessionType: varchar("session_type", { length: 50 }).default('session'), // session, workshop, break, lunch, etc.
  requiresRegistration: boolean("requires_registration").default(false),
  materials: text("materials"), // Links to presentation materials
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("event_sessions_event_idx").on(table.eventId),
  index("event_sessions_start_time_idx").on(table.startTime),
]);

export const eventSessionRegistrations = pgTable("event_session_registrations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => eventSessions.id, { onDelete: "cascade" }),
  registrationId: integer("registration_id").notNull().references(() => eventRegistrations.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at").defaultNow(),
}, (table) => [
  index("event_session_registrations_session_idx").on(table.sessionId),
  index("event_session_registrations_registration_idx").on(table.registrationId),
  unique("unique_session_attendance").on(table.sessionId, table.registrationId),
]);

// Event Management Insert Schemas and Types
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ id: true });
export const insertEventSessionSchema = createInsertSchema(eventSessions).omit({ id: true });
export const insertEventSessionRegistrationSchema = createInsertSchema(eventSessionRegistrations).omit({ id: true });

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

export type InsertEventSession = z.infer<typeof insertEventSessionSchema>;
export type EventSession = typeof eventSessions.$inferSelect;

export type InsertEventSessionRegistration = z.infer<typeof insertEventSessionRegistrationSchema>;
export type EventSessionRegistration = typeof eventSessionRegistrations.$inferSelect;
