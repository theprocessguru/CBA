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
  // Personal Badge System
  qrHandle: varchar("qr_handle").unique(), // e.g., "theprocessguru"
  title: varchar("title"), // e.g., "Mayor", "Executive Mayor", "CEO", "Founder"
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  phone: varchar("phone"),
  bio: text("bio"),
  // Email verification fields
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  // Deprecated - use userPersonTypes table instead
  participantType: varchar("participant_type").default("attendee"), // attendee, volunteer, speaker, etc.
  // Profile visibility
  isProfileHidden: boolean("is_profile_hidden").default(false), // If true, profile won't appear in directories or public areas
  // Volunteer/Student specific fields
  university: varchar("university"),
  studentId: varchar("student_id"),
  course: varchar("course"),
  yearOfStudy: varchar("year_of_study"),
  communityRole: varchar("community_role"),
  volunteerExperience: text("volunteer_experience"),
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

// Events Management System - Support for multiple event types
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(), // e.g., "AI Summit 2025", "January Networking Event"
  eventType: varchar("event_type").notNull(), // networking, workshop, summit, conference, exhibition, seminar
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location").notNull(),
  maxCapacity: integer("max_capacity"),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }),
  status: varchar("status").default("draft"), // draft, published, ongoing, completed, cancelled
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Registrations - Generic registration for any event type
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  participantType: varchar("participant_type").default("attendee"), // attendee, speaker, exhibitor, volunteer, sponsor
  dietaryRequirements: text("dietary_requirements"),
  accessibilityNeeds: text("accessibility_needs"),
  specialRequests: text("special_requests"),
  ticketType: varchar("ticket_type"), // standard, vip, member, early_bird
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentDate: timestamp("payment_date"),
  checkInStatus: boolean("checked_in").default(false),
  checkInTime: timestamp("check_in_time"),
  badgeId: varchar("badge_id").unique(),
  registeredAt: timestamp("registered_at").defaultNow(),
}, (table) => [
  unique("unique_event_registration").on(table.eventId, table.email),
]);

// Event Exhibitors - For events with exhibitions
export const eventExhibitors = pgTable("event_exhibitors", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  registrationId: integer("registration_id").references(() => eventRegistrations.id),
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  businessDescription: text("business_description"),
  productsServices: text("products_services"),
  boothType: varchar("booth_type"), // standard, premium, custom
  standLocation: varchar("stand_location"), // e.g., "Hall A", "Main Hall"
  standNumber: varchar("stand_number"), // e.g., "A12", "B45"
  standSize: varchar("stand_size"), // e.g., "3x3m", "6x3m"
  electricalNeeds: boolean("electrical_needs").default(false),
  internetNeeds: boolean("internet_needs").default(false),
  specialRequirements: text("special_requirements"),
  setupTime: timestamp("setup_time"),
  breakdownTime: timestamp("breakdown_time"),
  staffCount: integer("staff_count").default(1),
  status: varchar("status").default("confirmed"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Speakers - For events with speakers
export const eventSpeakers = pgTable("event_speakers", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  registrationId: integer("registration_id").references(() => eventRegistrations.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  bio: text("bio"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  linkedIn: varchar("linked_in"),
  website: varchar("website"),
  photoUrl: varchar("photo_url"),
  sessionTitle: varchar("session_title"),
  sessionDescription: text("session_description"),
  sessionType: varchar("session_type"), // keynote, workshop, panel, presentation
  sessionDuration: integer("session_duration"), // in minutes
  sessionTime: timestamp("session_time"),
  sessionRoom: varchar("session_room"),
  techRequirements: text("tech_requirements"),
  status: varchar("status").default("confirmed"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Volunteers - For events needing volunteers
export const eventVolunteers = pgTable("event_volunteers", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  registrationId: integer("registration_id").references(() => eventRegistrations.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  role: varchar("role"), // registration, information, technical, logistics, security
  shift: varchar("shift"), // morning, afternoon, full_day
  experience: text("experience"),
  availability: text("availability"),
  tShirtSize: varchar("t_shirt_size"),
  emergencyContact: varchar("emergency_contact"),
  status: varchar("status").default("confirmed"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Sponsors - For events with sponsorship
export const eventSponsors = pgTable("event_sponsors", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  companyName: varchar("company_name").notNull(),
  contactName: varchar("contact_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  logoUrl: varchar("logo_url"),
  sponsorshipTier: varchar("sponsorship_tier"), // bronze, silver, gold, platinum
  sponsorshipAmount: decimal("sponsorship_amount", { precision: 10, scale: 2 }),
  benefits: text("benefits"), // JSON array of benefits
  specialRequests: text("special_requests"),
  invoiceSent: boolean("invoice_sent").default(false),
  paymentReceived: boolean("payment_received").default(false),
  status: varchar("status").default("pending"), // pending, confirmed, cancelled
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
  participantRoles: text("participant_roles").notNull().default('["attendee"]'), // JSON array of roles: attendee, exhibitor, speaker, organizer, volunteer, team
  customRole: varchar("custom_role"), // For custom role descriptions
  emailVerified: boolean("email_verified").default(false), // Email verification status
  emailVerificationToken: varchar("email_verification_token"), // Token for email verification
  emailVerificationSentAt: timestamp("email_verification_sent_at"), // When verification email was sent
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
  standLocation: varchar("stand_location"), // e.g., "Hall A", "Main Exhibition Hall", "Outdoor Area"
  standNumber: varchar("stand_number"), // e.g., "A12", "B45", "C103"
  standSize: varchar("stand_size"), // e.g., "3x3m", "6x3m", "9x3m"
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
  // Speaker prefixed fields for frontend compatibility
  speakerName: varchar("speaker_name"),
  speakerEmail: varchar("speaker_email"),
  speakerPhone: varchar("speaker_phone"),
  speakerCompany: varchar("speaker_company"),
  speakerJobTitle: varchar("speaker_job_title"),
  speakerWebsite: varchar("speaker_website"),
  speakerLinkedIn: varchar("speaker_linked_in"),
  speakerBio: text("speaker_bio"),
  sessionType: varchar("session_type").default("talk"), // talk, workshop
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
  createdAt: timestamp("created_at").defaultNow(), // Add for compatibility
  status: varchar("status").default("pending"), // Add status field for frontend
});

// Personal Badges - Reusable across all events with role-based styling
export const personalBadges = pgTable("personal_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").unique().notNull(), // User's unique badge ID like "CBA-THEPROCESSGURU"
  qrHandle: varchar("qr_handle").unique().notNull(), // Custom handle like "theprocessguru"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Badge Assignments - Links personal badges to specific events with roles
export const eventBadgeAssignments = pgTable("event_badge_assignments", {
  id: serial("id").primaryKey(),
  badgeId: varchar("badge_id").notNull().references(() => personalBadges.badgeId),
  eventId: varchar("event_id").notNull(), // e.g., "ai-summit-2025", "networking-nov-2025"
  eventName: varchar("event_name").notNull(), // e.g., "First AI Summit Croydon 2025"
  participantRoles: text("participant_roles").notNull().default('["attendee"]'), // JSON array of roles: attendee, exhibitor, speaker, organizer, volunteer, team
  primaryRole: varchar("primary_role").notNull().default("attendee"), // Main role for display purposes
  badgeColor: varchar("badge_color").notNull(), // blue, green, red, gold, purple based on primary role
  accessLevel: varchar("access_level").notNull(), // basic, premium, vip, staff, admin
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// AI Summit badges table
export const aiSummitBadges = pgTable("ai_summit_badges", {
  id: serial("id").primaryKey(),
  badgeId: varchar("badge_id").notNull().unique(), // Unique identifier for QR code
  participantRoles: text("participant_roles").notNull().default('["attendee"]'), // JSON array of roles: attendee, exhibitor, speaker, organizer, volunteer, team
  primaryRole: varchar("primary_role").notNull().default("attendee"), // Main role for badge design
  customRole: varchar("custom_role"), // For custom role descriptions
  participantId: varchar("participant_id").notNull(), // Reference to the registration ID
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  badgeDesign: varchar("badge_design").default("standard"), // standard, vip, speaker, volunteer, team
  qrCodeData: text("qr_code_data").notNull(), // JSON string with encoded badge info
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

// Membership Tiers table
export const membershipTiers = pgTable("membership_tiers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  monthlyPrice: integer("monthly_price").notNull(),
  yearlyPrice: integer("yearly_price").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull().default(sql`'{}'::text[]`),
  aiCredits: integer("ai_credits").notNull().default(0),
  maxEvents: integer("max_events").notNull().default(0),
  maxNetworking: integer("max_networking").notNull().default(0),
  priority: integer("priority").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  color: text("color").notNull().default('#3B82F6'),
  icon: text("icon").notNull().default('crown'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MembershipTier = typeof membershipTiers.$inferSelect;
export type InsertMembershipTier = typeof membershipTiers.$inferInsert;

// Email Templates table for customizable messages
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  personType: varchar("person_type").notNull(), // volunteer, vip, speaker, exhibitor, sponsor, etc.
  templateName: varchar("template_name").notNull(), // friendly name for the template
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  smsContent: text("sms_content"),
  mytTags: jsonb("myt_tags").$type<string[]>().default([]),
  mytWorkflow: varchar("myt_workflow"),
  variables: jsonb("variables").$type<string[]>().default([]), // List of available variables like {{firstName}}, {{company}}, etc.
  isActive: boolean("is_active").default(true),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// CBA Events management system
export const cbaEvents = pgTable("cba_events", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name").notNull(),
  eventSlug: varchar("event_slug").notNull(), // URL-friendly identifier
  description: text("description"),
  eventType: varchar("event_type").notNull(), // workshop, networking, summit, webinar, social
  eventDate: timestamp("event_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  venue: varchar("venue").notNull(),
  venueAddress: text("venue_address"),
  maxCapacity: integer("max_capacity").notNull(),
  currentRegistrations: integer("current_registrations").default(0),
  registrationDeadline: timestamp("registration_deadline"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  registrationFee: integer("registration_fee").default(0), // in pence
  memberPrice: integer("member_price").default(0), // special member pricing
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"), // weekly, monthly, etc.
  tags: text("tags"), // JSON array of event tags
  imageUrl: text("image_url"),
  ghlWorkflowId: varchar("ghl_workflow_id"), // MyT Automation workflow ID for automation
  ghlTagName: varchar("ghl_tag_name"), // MyT Automation tag for attendees
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event time slots for detailed scheduling
export const eventTimeSlots = pgTable("event_time_slots", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => cbaEvents.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(), // e.g., "Opening Keynote", "Break", "Panel Discussion"
  description: text("description"),
  slotType: varchar("slot_type").notNull(), // presentation, panel, break, networking, workshop, q&a
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  room: varchar("room"), // Room or location within venue
  maxCapacity: integer("max_capacity"),
  currentAttendees: integer("current_attendees").default(0),
  speakerId: varchar("speaker_id").references(() => users.id), // Primary speaker
  moderatorId: varchar("moderator_id").references(() => users.id), // Moderator for panels
  isBreak: boolean("is_break").default(false), // For lunch, coffee breaks, etc.
  materials: text("materials"), // Links or descriptions of session materials
  streamingUrl: varchar("streaming_url"), // For hybrid/virtual events
  recordingUrl: varchar("recording_url"), // Post-event recording
  tags: text("tags"), // JSON array of topic tags
  requiresRegistration: boolean("requires_registration").default(false), // If specific slot needs separate registration
  displayOrder: integer("display_order").default(0), // For ordering in schedule
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Many-to-many relationship for multiple speakers per time slot
export const timeSlotSpeakers = pgTable("time_slot_speakers", {
  id: serial("id").primaryKey(),
  timeSlotId: integer("time_slot_id").notNull().references(() => eventTimeSlots.id, { onDelete: "cascade" }),
  speakerId: varchar("speaker_id").notNull().references(() => users.id),
  role: varchar("role").default("speaker"), // speaker, co-speaker, panelist, moderator
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event registrations with enhanced tracking  
export const cbaEventRegistrations = pgTable("cba_event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => cbaEvents.id),
  userId: varchar("user_id").references(() => users.id),
  personalBadgeId: integer("personal_badge_id").references(() => personalBadges.id),
  participantName: varchar("participant_name").notNull(),
  participantEmail: varchar("participant_email").notNull(),
  participantPhone: varchar("participant_phone"),
  participantCompany: varchar("participant_company"),
  participantJobTitle: varchar("participant_job_title"),
  membershipTier: varchar("membership_tier"),
  registrationSource: varchar("registration_source").default("website"), // website, referral, social, email
  specialRequirements: text("special_requirements"),
  dietaryRequirements: text("dietary_requirements"),
  accessibilityNeeds: text("accessibility_needs"),
  networkingInterests: text("networking_interests"),
  registrationStatus: varchar("registration_status").default("confirmed"), // pending, confirmed, cancelled, waitlist
  paymentStatus: varchar("payment_status").default("not_required"), // not_required, pending, paid, refunded
  paymentAmount: integer("payment_amount").default(0),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  checkedOut: boolean("checked_out").default(false),
  checkedOutAt: timestamp("checked_out_at"),
  noShow: boolean("no_show").default(false),
  feedbackRating: integer("feedback_rating"), // 1-5 rating
  feedbackComments: text("feedback_comments"),
  ghlContactId: varchar("ghl_contact_id"), // MyT Automation contact ID
  ghlTagsApplied: text("ghl_tags_applied"), // JSON array of applied MyT Automation tags
  registeredAt: timestamp("registered_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Prevent duplicate registrations for same event
  index("event_registrations_unique_idx").on(table.eventId, table.participantEmail)
]);

// Event attendance analytics for MyT Automation integration
export const eventAttendanceAnalytics = pgTable("event_attendance_analytics", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => cbaEvents.id),
  userId: varchar("user_id").references(() => users.id),
  userEmail: varchar("user_email").notNull(),
  attendancePattern: varchar("attendance_pattern"), // regular, occasional, first_time, no_show_pattern
  totalEventsRegistered: integer("total_events_registered").default(0),
  totalEventsAttended: integer("total_events_attended").default(0),
  totalNoShows: integer("total_no_shows").default(0),
  attendanceRate: decimal("attendance_rate", { precision: 5, scale: 2 }).default("0"),
  lastEventAttended: timestamp("last_event_attended"),
  missedEventWorkflowTriggered: boolean("missed_event_workflow_triggered").default(false),
  missedEventWorkflowDate: timestamp("missed_event_workflow_date"),
  ghlWorkflowsTriggered: text("ghl_workflows_triggered"), // JSON array of triggered workflows
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced personal badge events linking
export const personalBadgeEvents = pgTable("personal_badge_events", {
  id: serial("id").primaryKey(),
  personalBadgeId: integer("personal_badge_id").notNull().references(() => personalBadges.id),
  eventId: integer("event_id").notNull().references(() => cbaEvents.id),
  roleAtEvent: varchar("role_at_event").default("attendee"), // attendee, speaker, exhibitor, volunteer, organizer
  badgeDesign: varchar("badge_design").default("standard"), // standard, speaker, vip, organizer
  customFields: text("custom_fields"), // JSON for event-specific badge customization
  qrCodeData: text("qr_code_data").notNull(), // Event-specific QR data
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  checkedOut: boolean("checked_out").default(false),
  checkedOutAt: timestamp("checked_out_at"),
  badgePrinted: boolean("badge_printed").default(false),
  badgePrintedAt: timestamp("badge_printed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Ensure one badge per event per person
  index("badge_event_unique_idx").on(table.personalBadgeId, table.eventId)
]);

// MyT Automation tracking
export const mytAutomationLogs = pgTable("ghl_automation_logs", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => cbaEvents.id),
  userId: varchar("user_id").references(() => users.id),
  userEmail: varchar("user_email").notNull(),
  automationType: varchar("automation_type").notNull(), // registration_confirmation, reminder, no_show_followup, feedback_request
  workflowId: varchar("workflow_id").notNull(), // MyT Automation workflow ID
  triggerReason: varchar("trigger_reason").notNull(), // registered, checked_in, no_show, event_ended
  status: varchar("status").default("pending"), // pending, sent, delivered, failed
  ghlResponse: text("ghl_response"), // JSON response from MyT Automation API
  retryCount: integer("retry_count").default(0),
  lastRetryAt: timestamp("last_retry_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event feedback and ratings
export const eventFeedback = pgTable("event_feedback", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => cbaEvents.id),
  userId: varchar("user_id").references(() => users.id),
  participantEmail: varchar("participant_email").notNull(),
  overallRating: integer("overall_rating").notNull(), // 1-5 stars
  contentQuality: integer("content_quality"), // 1-5 stars
  organizationRating: integer("organization_rating"), // 1-5 stars
  networkingValue: integer("networking_value"), // 1-5 stars
  venueRating: integer("venue_rating"), // 1-5 stars
  wouldRecommend: boolean("would_recommend"),
  mostValuable: text("most_valuable"), // What was most valuable
  improvements: text("improvements"), // Suggestions for improvement
  futureTopics: text("future_topics"), // Topics they'd like to see
  additionalComments: text("additional_comments"),
  isAnonymous: boolean("is_anonymous").default(false),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Event Scanners table - Track team members and volunteers who can scan
export const eventScanners = pgTable('event_scanners', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  eventId: integer('event_id').references(() => cbaEvents.id),
  scannerRole: text('scanner_role').notNull(), // 'team_member', 'volunteer', 'organizer'
  isActive: boolean('is_active').default(true),
  assignedBy: text('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at').defaultNow(),
  totalScansCompleted: integer('total_scans_completed').default(0)
});

// Scan History table - Log every scan interaction
export const scanHistory = pgTable('scan_history', {
  id: serial('id').primaryKey(),
  scannerId: text('scanner_id').notNull().references(() => users.id), // Who did the scanning
  scannedUserId: text('scanned_user_id').notNull().references(() => users.id), // Who was scanned
  eventId: integer('event_id').references(() => cbaEvents.id),
  personalBadgeEventId: integer('personal_badge_event_id').references(() => personalBadgeEvents.id),
  scanType: text('scan_type').notNull(), // 'check_in', 'check_out', 'verification', 'networking'
  scanLocation: text('scan_location'), // Where the scan happened (entrance, workshop room, etc.)
  scanNotes: text('scan_notes'), // Optional notes about the scan
  deviceInfo: text('device_info'), // Scanner device information
  scanTimestamp: timestamp('scan_timestamp').defaultNow(),
  isValidScan: boolean('is_valid_scan').default(true),
  duplicateScanFlag: boolean('duplicate_scan_flag').default(false)
});

// Scan Sessions table - Track scanning sessions for analytics
export const scanSessions = pgTable('scan_sessions', {
  id: serial('id').primaryKey(),
  scannerId: text('scanner_id').notNull().references(() => users.id),
  eventId: integer('event_id').references(() => cbaEvents.id),
  sessionStart: timestamp('session_start').defaultNow(),
  sessionEnd: timestamp('session_end'),
  totalScans: integer('total_scans').default(0),
  uniqueScans: integer('unique_scans').default(0),
  duplicateScans: integer('duplicate_scans').default(0),
  sessionNotes: text('session_notes')
});

// Exhibitor Stand Visitors table - Track all visitors to exhibitor stands
export const exhibitorStandVisitors = pgTable('exhibitor_stand_visitors', {
  id: serial('id').primaryKey(),
  exhibitorId: text('exhibitor_id').notNull().references(() => users.id), // The exhibitor who owns the stand
  visitorId: text('visitor_id').notNull().references(() => users.id), // The visitor who was scanned
  eventId: integer('event_id').references(() => cbaEvents.id), // Which event this occurred at
  standNumber: varchar('stand_number'), // Exhibition stand number/location
  scanTime: timestamp('scan_time').defaultNow(),
  visitorType: varchar('visitor_type'), // attendee, student, resident, volunteer, vip, speaker, etc.
  visitorName: varchar('visitor_name'),
  visitorEmail: varchar('visitor_email'),
  visitorPhone: varchar('visitor_phone'),
  visitorCompany: varchar('visitor_company'),
  visitorTitle: varchar('visitor_title'),
  visitorUniversity: varchar('visitor_university'), // For students
  visitorCourse: varchar('visitor_course'), // For students
  notes: text('notes'), // Any notes the exhibitor wants to add
  followUpStatus: varchar('follow_up_status').default('pending'), // pending, contacted, not_interested, converted
  followUpNotes: text('follow_up_notes'),
  lastContactedAt: timestamp('last_contacted_at'),
  tags: text('tags'), // JSON array of tags for categorization
  interestedIn: text('interested_in'), // What products/services they were interested in
  leadScore: integer('lead_score').default(0), // 0-100 score for lead quality
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Event Sponsorship Packages
export const sponsorshipPackages = pgTable('sponsorship_packages', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => cbaEvents.id),
  packageName: varchar('package_name').notNull(), // Bronze, Silver, Gold, Platinum
  packageLevel: integer('package_level').notNull(), // 1-4 for sorting
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  benefits: text('benefits').array(), // Array of benefit descriptions
  maxSponsors: integer('max_sponsors').default(null), // null means unlimited
  currentSponsors: integer('current_sponsors').default(0),
  logoPlacement: varchar('logo_placement'), // website, banner, stage, materials
  bannerAds: boolean('banner_ads').default(false),
  lanyardBranding: boolean('lanyard_branding').default(false),
  boothSpace: varchar('booth_space'), // small, medium, large, premium
  speakingSlot: boolean('speaking_slot').default(false),
  attendeeListAccess: boolean('attendee_list_access').default(false),
  socialMediaMentions: integer('social_media_mentions').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// CBA Event Sponsors (renamed to avoid conflict with generic eventSponsors)
export const cbaEventSponsors = pgTable('cba_event_sponsors', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => cbaEvents.id),
  packageId: integer('package_id').notNull().references(() => sponsorshipPackages.id),
  companyName: varchar('company_name').notNull(),
  contactName: varchar('contact_name').notNull(),
  contactEmail: varchar('contact_email').notNull(),
  contactPhone: varchar('contact_phone'),
  companyWebsite: varchar('company_website'),
  logoUrl: text('logo_url'),
  companyDescription: text('company_description'),
  sponsorshipAmount: decimal('sponsorship_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar('payment_status').default('pending'), // pending, paid, cancelled
  paymentDate: timestamp('payment_date'),
  invoiceNumber: varchar('invoice_number'),
  specialRequests: text('special_requests'),
  approvalStatus: varchar('approval_status').default('pending'), // pending, approved, rejected
  approvedBy: varchar('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
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

// Enhanced Event System Schemas
export const insertCBAEventSchema = createInsertSchema(cbaEvents, {
  eventDate: z.string().transform((val) => new Date(val)),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  registrationDeadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  imageUrl: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, currentRegistrations: true });

// Event time slot schemas and types
export const insertEventTimeSlotSchema = createInsertSchema(eventTimeSlots, {
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
}).omit({ 
  id: true,
  currentAttendees: true,
  createdAt: true,
  updatedAt: true 
});

export const insertTimeSlotSpeakerSchema = createInsertSchema(timeSlotSpeakers).omit({
  id: true,
  createdAt: true,
});

export type EventTimeSlot = typeof eventTimeSlots.$inferSelect;
export type InsertEventTimeSlot = z.infer<typeof insertEventTimeSlotSchema>;
export type TimeSlotSpeaker = typeof timeSlotSpeakers.$inferSelect;
export type InsertTimeSlotSpeaker = z.infer<typeof insertTimeSlotSpeakerSchema>;
export const insertCBAEventRegistrationSchema = createInsertSchema(cbaEventRegistrations).omit({ id: true });
export const insertEventAttendanceAnalyticsSchema = createInsertSchema(eventAttendanceAnalytics).omit({ id: true });
export const insertPersonalBadgeEventSchema = createInsertSchema(personalBadgeEvents).omit({ id: true });
export const insertMyTAutomationLogSchema = createInsertSchema(mytAutomationLogs).omit({ id: true });
export const insertEventFeedbackSchema = createInsertSchema(eventFeedback).omit({ id: true });

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

// Personal Badge System Schemas
export const insertPersonalBadgeSchema = createInsertSchema(personalBadges).omit({ id: true });
export const insertEventBadgeAssignmentSchema = createInsertSchema(eventBadgeAssignments).omit({ id: true });

export type InsertPersonalBadge = z.infer<typeof insertPersonalBadgeSchema>;
export type PersonalBadge = typeof personalBadges.$inferSelect;

export type InsertEventBadgeAssignment = z.infer<typeof insertEventBadgeAssignmentSchema>;
export type EventBadgeAssignment = typeof eventBadgeAssignments.$inferSelect;

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

// Event Mood Sentiment Tracking System
export const eventMoodEntries = pgTable("event_mood_entries", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => cbaEvents.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id),
  sessionName: varchar("session_name"),
  moodType: varchar("mood_type").notNull(), // happy, excited, inspired, focused, confused, bored, frustrated, neutral
  intensity: integer("intensity").notNull().default(5), // 1-10 scale
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time mood aggregation for quick display
export const eventMoodAggregations = pgTable("event_mood_aggregations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => cbaEvents.id, { onDelete: "cascade" }),
  sessionName: varchar("session_name"),
  moodType: varchar("mood_type").notNull(),
  totalCount: integer("total_count").default(0),
  averageIntensity: decimal("average_intensity", { precision: 3, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Enhanced Event System Types
export type InsertCBAEvent = z.infer<typeof insertCBAEventSchema>;
export type CBAEvent = typeof cbaEvents.$inferSelect;

export type InsertCBAEventRegistration = z.infer<typeof insertCBAEventRegistrationSchema>;
export type CBAEventRegistration = typeof cbaEventRegistrations.$inferSelect;

export type InsertEventAttendanceAnalytics = z.infer<typeof insertEventAttendanceAnalyticsSchema>;
export type EventAttendanceAnalytics = typeof eventAttendanceAnalytics.$inferSelect;

export type InsertPersonalBadgeEvent = z.infer<typeof insertPersonalBadgeEventSchema>;
export type PersonalBadgeEvent = typeof personalBadgeEvents.$inferSelect;

export type InsertMyTAutomationLog = z.infer<typeof insertMyTAutomationLogSchema>;
export type MyTAutomationLog = typeof mytAutomationLogs.$inferSelect;

export type InsertEventFeedback = z.infer<typeof insertEventFeedbackSchema>;
export type EventFeedback = typeof eventFeedback.$inferSelect;

// Event Mood System Types and Schemas
export const insertEventMoodEntrySchema = createInsertSchema(eventMoodEntries).omit({ id: true, createdAt: true });
export const insertEventMoodAggregationSchema = createInsertSchema(eventMoodAggregations).omit({ id: true, lastUpdated: true });

export type InsertEventMoodEntry = z.infer<typeof insertEventMoodEntrySchema>;
export type EventMoodEntry = typeof eventMoodEntries.$inferSelect;
export type InsertEventMoodAggregation = z.infer<typeof insertEventMoodAggregationSchema>;
export type EventMoodAggregation = typeof eventMoodAggregations.$inferSelect;

// Scanning system schemas
export const insertEventScannerSchema = createInsertSchema(eventScanners).omit({ id: true });
export const insertScanHistorySchema = createInsertSchema(scanHistory).omit({ id: true });
export const insertScanSessionSchema = createInsertSchema(scanSessions).omit({ id: true });
export const insertExhibitorStandVisitorSchema = createInsertSchema(exhibitorStandVisitors).omit({ id: true });

export type InsertEventScanner = z.infer<typeof insertEventScannerSchema>;
export type EventScanner = typeof eventScanners.$inferSelect;

export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;
export type ScanHistory = typeof scanHistory.$inferSelect;

export type InsertScanSession = z.infer<typeof insertScanSessionSchema>;
export type ScanSession = typeof scanSessions.$inferSelect;

export type InsertExhibitorStandVisitor = z.infer<typeof insertExhibitorStandVisitorSchema>;
export type ExhibitorStandVisitor = typeof exhibitorStandVisitors.$inferSelect;

// Event Management System Types and Schemas
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ id: true, registeredAt: true });
export const insertEventExhibitorSchema = createInsertSchema(eventExhibitors).omit({ id: true, createdAt: true });
export const insertEventSpeakerSchema = createInsertSchema(eventSpeakers).omit({ id: true, createdAt: true });
export const insertEventVolunteerSchema = createInsertSchema(eventVolunteers).omit({ id: true, createdAt: true });
export const insertEventSponsorSchema = createInsertSchema(eventSponsors).omit({ id: true, createdAt: true });

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

export type InsertEventExhibitor = z.infer<typeof insertEventExhibitorSchema>;
export type EventExhibitor = typeof eventExhibitors.$inferSelect;

export type InsertEventSpeaker = z.infer<typeof insertEventSpeakerSchema>;
export type EventSpeaker = typeof eventSpeakers.$inferSelect;

export type InsertEventVolunteer = z.infer<typeof insertEventVolunteerSchema>;
export type EventVolunteer = typeof eventVolunteers.$inferSelect;

export type InsertEventSponsor = z.infer<typeof insertEventSponsorSchema>;
export type EventSponsor = typeof eventSponsors.$inferSelect;

// CBA Events Types
export type InsertCBAEvent = z.infer<typeof insertCBAEventSchema>;
export type CBAEvent = typeof cbaEvents.$inferSelect;

export type InsertCBAEventRegistration = z.infer<typeof insertCBAEventRegistrationSchema>;
export type CBAEventRegistration = typeof cbaEventRegistrations.$inferSelect;

// Membership Tier Schema and Types
export const insertMembershipTierSchema = createInsertSchema(membershipTiers, {
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  monthlyPrice: z.number().min(0, "Monthly price cannot be negative"),
  yearlyPrice: z.number().min(0, "Yearly price cannot be negative"),
  description: z.string().min(1, "Description is required"),
  features: z.array(z.string()).default([]),
  aiCredits: z.number().min(0, "AI credits cannot be negative"),
  maxEvents: z.number().min(0, "Max events cannot be negative"),
  maxNetworking: z.number().min(0, "Max networking cannot be negative"),
  priority: z.number().min(0, "Priority cannot be negative"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
});

export type InsertMembershipTier = z.infer<typeof insertMembershipTierSchema>;
export type MembershipTier = typeof membershipTiers.$inferSelect;

// Benefits table for managing all membership benefits
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(), // e.g., "Enhanced directory listing"
  description: text("description"), // Detailed description of the benefit
  category: varchar("category").notNull(), // e.g., "networking", "support", "marketing", "ai_services", "automation"
  isActive: boolean("is_active").default(true), // Controls whether benefit appears in dropdowns
  sortOrder: integer("sort_order").default(0), // For ordering in lists
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table to link membership tiers with benefits
export const membershipTierBenefits = pgTable("membership_tier_benefits", {
  id: serial("id").primaryKey(),
  tierName: varchar("tier_name").notNull().references(() => membershipTiers.name, { onDelete: "cascade" }),
  benefitId: integer("benefit_id").notNull().references(() => benefits.id, { onDelete: "cascade" }),
  isIncluded: boolean("is_included").default(true), // Whether this tier includes this benefit
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_tier_benefit").on(table.tierName, table.benefitId),
  index("membership_tier_benefits_tier_idx").on(table.tierName),
  index("membership_tier_benefits_benefit_idx").on(table.benefitId),
]);

// Benefits Schema and Types
export const insertBenefitSchema = createInsertSchema(benefits, {
  name: z.string().min(1, "Benefit name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0, "Sort order cannot be negative"),
}).omit({ id: true });

export const insertMembershipTierBenefitSchema = createInsertSchema(membershipTierBenefits, {
  tierName: z.string().min(1, "Tier name is required"),
  benefitId: z.number().min(1, "Benefit ID is required"),
  isIncluded: z.boolean().default(true),
}).omit({ id: true });

export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Benefit = typeof benefits.$inferSelect;

export type InsertMembershipTierBenefit = z.infer<typeof insertMembershipTierBenefitSchema>;
export type MembershipTierBenefit = typeof membershipTierBenefits.$inferSelect;

// Sponsorship Package Schema and Types
export const insertSponsorshipPackageSchema = createInsertSchema(sponsorshipPackages, {
  eventId: z.number().optional(),
  packageName: z.string().min(1, "Package name is required"),
  packageLevel: z.number().min(1).max(4),
  price: z.string().min(1, "Price is required"),
  benefits: z.array(z.string()).optional(),
  maxSponsors: z.number().nullable().optional(),
  logoPlacement: z.string().optional(),
  bannerAds: z.boolean().default(false),
  lanyardBranding: z.boolean().default(false),
  boothSpace: z.string().optional(),
  speakingSlot: z.boolean().default(false),
  attendeeListAccess: z.boolean().default(false),
  socialMediaMentions: z.number().default(0),
  isActive: z.boolean().default(true),
}).omit({ id: true, currentSponsors: true, createdAt: true, updatedAt: true });

export type InsertSponsorshipPackage = z.infer<typeof insertSponsorshipPackageSchema>;
export type SponsorshipPackage = typeof sponsorshipPackages.$inferSelect;

// CBA Event Sponsor Schema and Types (using cbaEventSponsors table)
export const insertCBAEventSponsorSchema = createInsertSchema(cbaEventSponsors, {
  eventId: z.number().min(1, "Event ID is required"),
  packageId: z.number().min(1, "Package ID is required"),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  companyWebsite: z.string().optional(),
  logoUrl: z.string().optional(),
  companyDescription: z.string().optional(),
  sponsorshipAmount: z.string().min(1, "Sponsorship amount is required"),
  specialRequests: z.string().optional(),
}).omit({ 
  id: true, 
  paymentStatus: true, 
  paymentDate: true, 
  invoiceNumber: true,
  approvalStatus: true,
  approvedBy: true,
  approvedAt: true,
  isActive: true,
  createdAt: true, 
  updatedAt: true 
});

export type InsertCBAEventSponsor = z.infer<typeof insertCBAEventSponsorSchema>;
export type CBAEventSponsor = typeof cbaEventSponsors.$inferSelect;

// Affiliate Programme Tables
export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  affiliateCode: varchar("affiliate_code").notNull().unique(), // Unique referral code
  stripeAccountId: varchar("stripe_account_id"), // Stripe Connect account ID for payouts
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("5.00"), // Default 5%
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  pendingEarnings: decimal("pending_earnings", { precision: 10, scale: 2 }).default("0.00"),
  paidEarnings: decimal("paid_earnings", { precision: 10, scale: 2 }).default("0.00"),
  lastPayoutDate: timestamp("last_payout_date"),
  payoutMethod: varchar("payout_method").default("stripe"), // stripe, bank_transfer, paypal
  payoutDetails: jsonb("payout_details"), // Store payment method details
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("affiliates_user_idx").on(table.userId),
  index("affiliates_code_idx").on(table.affiliateCode),
]);

// Track referred members
export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  referralDate: timestamp("referral_date").defaultNow(),
  signupDate: timestamp("signup_date"),
  firstPaymentDate: timestamp("first_payment_date"),
  currentMembershipTier: varchar("current_membership_tier"),
  membershipStatus: varchar("membership_status").default("pending"), // pending, trial, active, cancelled
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default("0.00"),
  totalCommissionEarned: decimal("total_commission_earned", { precision: 10, scale: 2 }).default("0.00"),
  lastCommissionDate: timestamp("last_commission_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_referral").on(table.referredUserId),
  index("referrals_affiliate_idx").on(table.affiliateId),
  index("referrals_referred_user_idx").on(table.referredUserId),
]);

// Commission tracking
export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
  referralId: integer("referral_id").notNull().references(() => affiliateReferrals.id),
  paymentId: varchar("payment_id"), // Reference to payment/subscription in your payment system
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  status: varchar("status").default("pending"), // pending, approved, paid, cancelled
  payoutId: integer("payout_id"), // Will reference affiliatePayouts.id
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("commissions_affiliate_idx").on(table.affiliateId),
  index("commissions_referral_idx").on(table.referralId),
  index("commissions_status_idx").on(table.status),
]);

// Payout tracking
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("GBP"),
  method: varchar("method").notNull(), // stripe, bank_transfer, paypal
  stripeTransferId: varchar("stripe_transfer_id"),
  transactionReference: varchar("transaction_reference"),
  status: varchar("status").default("pending"), // pending, processing, completed, failed
  processedAt: timestamp("processed_at"),
  failureReason: text("failure_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("payouts_affiliate_idx").on(table.affiliateId),
  index("payouts_status_idx").on(table.status),
]);

// Affiliate link clicks tracking
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliates.id),
  affiliateCode: varchar("affiliate_code").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  landingPage: text("landing_page"),
  convertedToReferral: boolean("converted_to_referral").default(false),
  referralId: integer("referral_id").references(() => affiliateReferrals.id),
  clickedAt: timestamp("clicked_at").defaultNow(),
}, (table) => [
  index("clicks_affiliate_idx").on(table.affiliateId),
  index("clicks_code_idx").on(table.affiliateCode),
  index("clicks_date_idx").on(table.clickedAt),
]);

// Affiliate Schema and Types
export const insertAffiliateSchema = createInsertSchema(affiliates, {
  userId: z.string().min(1, "User ID is required"),
  affiliateCode: z.string().min(1, "Affiliate code is required"),
  commissionRate: z.string().default("5.00"),
  isActive: z.boolean().default(true),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

export const insertAffiliateReferralSchema = createInsertSchema(affiliateReferrals, {
  affiliateId: z.number().min(1, "Affiliate ID is required"),
  referredUserId: z.string().min(1, "Referred user ID is required"),
  currentMembershipTier: z.string().optional(),
  membershipStatus: z.string().default("pending"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertAffiliateReferral = z.infer<typeof insertAffiliateReferralSchema>;
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;

export const insertAffiliateCommissionSchema = createInsertSchema(affiliateCommissions, {
  affiliateId: z.number().min(1, "Affiliate ID is required"),
  referralId: z.number().min(1, "Referral ID is required"),
  amount: z.string().min(1, "Amount is required"),
  commissionAmount: z.string().min(1, "Commission amount is required"),
  commissionRate: z.string().min(1, "Commission rate is required"),
  paymentDate: z.date(),
  status: z.string().default("pending"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertAffiliateCommission = z.infer<typeof insertAffiliateCommissionSchema>;
export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;

export const insertAffiliatePayoutSchema = createInsertSchema(affiliatePayouts, {
  affiliateId: z.number().min(1, "Affiliate ID is required"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("GBP"),
  method: z.string().min(1, "Payment method is required"),
  status: z.string().default("pending"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertAffiliatePayout = z.infer<typeof insertAffiliatePayoutSchema>;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks, {
  affiliateId: z.number().min(1, "Affiliate ID is required"),
  affiliateCode: z.string().min(1, "Affiliate code is required"),
}).omit({ id: true });

export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// Person Types table - defines available person types
// Jobs Board Schema
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  jobType: text("job_type").notNull(), // full-time, part-time, contract, internship
  workMode: text("work_mode").notNull(), // on-site, remote, hybrid
  salary: text("salary"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  description: text("description").notNull(),
  requirements: text("requirements"),
  benefits: text("benefits"),
  applicationEmail: text("application_email"),
  applicationUrl: text("application_url"),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  category: text("category"),
  experienceLevel: text("experience_level"), // entry, mid, senior, executive
  tags: text("tags").array(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobPostings.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  applicantPhone: text("applicant_phone"),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  cvData: text("cv_data"), // Base64 encoded CV file
  cvFileName: text("cv_file_name"), // Original filename
  cvFileType: text("cv_file_type"), // MIME type
  cvUploadedAt: timestamp("cv_uploaded_at"),
  linkedinProfile: text("linkedin_profile"),
  status: text("status").default("pending"), // pending, reviewed, shortlisted, rejected, hired
  notes: text("notes"),
  appliedAt: timestamp("applied_at").default(sql`now()`),
  reviewedAt: timestamp("reviewed_at"),
});

export const jobSavedSearches = pgTable("job_saved_searches", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  searchName: text("search_name").notNull(),
  keywords: text("keywords"),
  location: text("location"),
  jobType: text("job_type"),
  workMode: text("work_mode"),
  category: text("category"),
  experienceLevel: text("experience_level"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  emailAlerts: boolean("email_alerts").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const personTypes = pgTable("person_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(), // e.g., "councillor", "speaker", "vip", "volunteer", "exhibitor"
  displayName: varchar("display_name").notNull(), // e.g., "Councillor", "Speaker", "VIP Guest"
  description: text("description"),
  color: varchar("color"), // For badge colors
  icon: varchar("icon"), // Icon identifier for UI
  priority: integer("priority").default(0), // Display order priority
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Person Types junction table - allows users to have multiple person types
export const userPersonTypes = pgTable("user_person_types", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  personTypeId: integer("person_type_id").notNull().references(() => personTypes.id),
  isPrimary: boolean("is_primary").default(false), // Marks the primary type for display
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by").references(() => users.id),
  notes: text("notes"),
}, (table) => [
  unique("unique_user_person_type").on(table.userId, table.personTypeId),
  index("user_person_types_user_idx").on(table.userId),
  index("user_person_types_type_idx").on(table.personTypeId),
]);

// Person Type Schema and Types
export const insertPersonTypeSchema = createInsertSchema(personTypes, {
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  priority: z.number().default(0),
  isActive: z.boolean().default(true),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertPersonType = z.infer<typeof insertPersonTypeSchema>;
export type PersonType = typeof personTypes.$inferSelect;

export const insertUserPersonTypeSchema = createInsertSchema(userPersonTypes, {
  userId: z.string().min(1, "User ID is required"),
  personTypeId: z.number().min(1, "Person type ID is required"),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
}).omit({ id: true, assignedAt: true });

export type InsertUserPersonType = z.infer<typeof insertUserPersonTypeSchema>;
export type UserPersonType = typeof userPersonTypes.$inferSelect;

// Jobs Board Schemas and Types
export const insertJobPostingSchema = createInsertSchema(jobPostings, {
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  jobType: z.enum(["full-time", "part-time", "contract", "internship", "temporary"]),
  workMode: z.enum(["on-site", "remote", "hybrid"]),
  salary: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  applicationEmail: z.string().email().optional(),
  applicationUrl: z.string().url().optional(),
  deadline: z.date().optional(),
  category: z.string().optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  tags: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, views: true });

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

export const insertJobApplicationSchema = createInsertSchema(jobApplications, {
  jobId: z.number().min(1, "Job ID is required"),
  userId: z.string().min(1, "User ID is required"),
  applicantName: z.string().min(1, "Name is required"),
  applicantEmail: z.string().email("Valid email is required"),
  applicantPhone: z.string().optional(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  cvData: z.string().optional(), // Base64 encoded CV
  cvFileName: z.string().optional(),
  cvFileType: z.string().optional(),
  cvUploadedAt: z.date().optional(),
  linkedinProfile: z.string().url().optional(),
  status: z.enum(["pending", "reviewed", "shortlisted", "rejected", "hired"]).default("pending"),
  notes: z.string().optional(),
}).omit({ id: true, appliedAt: true, reviewedAt: true });

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export const insertJobSavedSearchSchema = createInsertSchema(jobSavedSearches, {
  userId: z.string().min(1, "User ID is required"),
  searchName: z.string().min(1, "Search name is required"),
  keywords: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  workMode: z.string().optional(),
  category: z.string().optional(),
  experienceLevel: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  emailAlerts: z.boolean().default(false),
}).omit({ id: true, createdAt: true });

export type InsertJobSavedSearch = z.infer<typeof insertJobSavedSearchSchema>;
export type JobSavedSearch = typeof jobSavedSearches.$inferSelect;
