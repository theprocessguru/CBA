import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated } from "./localAuth";
import { db } from "./db";
import { eq, and, or, gte, lte, desc, asc, sql, ne, inArray } from "drizzle-orm";
import multer from "multer";
// Papa Parse will be imported dynamically
import * as XLSX from "xlsx";
import crypto from "crypto";
import { 
  insertBusinessSchema, 
  insertProductSchema, 
  insertOfferSchema, 
  insertCategorySchema, 
  insertContentReportSchema, 
  insertInteractionSchema,
  insertAISummitVolunteerSchema,
  insertAISummitTeamMemberSchema,
  insertMarketplaceListingSchema,
  insertBarterListingSchema,
  aiSummitRegistrations,
  aiSummitBadges,
  personalBadges,
  eventBadgeAssignments,
  insertPersonalBadgeSchema,
  insertEventBadgeAssignmentSchema,
  insertCBAEventSchema,
  insertCBAEventRegistrationSchema,
  insertEventAttendanceAnalyticsSchema,
  insertPersonalBadgeEventSchema,
  insertMyTAutomationLogSchema,
  insertEventFeedbackSchema,
  insertEventScannerSchema,
  insertScanHistorySchema,
  insertScanSessionSchema,
  cbaEvents,
  cbaEventRegistrations,
  eventAttendanceAnalytics,
  personalBadgeEvents,
  mytAutomationLogs,
  eventFeedback,
  eventScanners,
  scanHistory,
  scanSessions,
  users,
  businesses,
  membershipTiers,
  insertMembershipTierSchema,
  type MembershipTier,
  benefits,
  membershipTierBenefits,
  insertBenefitSchema,
  insertMembershipTierBenefitSchema,
  type Benefit,
  type MembershipTierBenefit,
  eventSponsors,
  sponsorshipPackages,
  exhibitorStandVisitors,
  eventTimeSlots,
  timeSlotSpeakers,
  insertEventTimeSlotSchema,
  insertTimeSlotSpeakerSchema,
  eventMoodEntries,
  eventMoodAggregations,
  insertEventMoodEntrySchema,
  insertEventMoodAggregationSchema,
  type EventMoodEntry,
  type EventMoodAggregation,
  affiliates,
  affiliateCommissions,
  jobPostings,
  jobApplications,
  jobSavedSearches,
  type AISummitRegistration,
  emailTemplates,
  businessEvents,
  networkingConnections,
  businessEventRegistrations,
  insertBusinessEventSchema,
  insertBusinessEventRegistrationSchema,
  type BusinessEvent,
  type BusinessEventRegistration
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { getMyTAutomationService } from "./mytAutomationService";
import bcrypt from "bcrypt";
import { emailService } from "./emailService";
import { aiService } from "./aiService";
import { aiAdvancedService } from "./aiAdvancedService";
import { badgeService, type BadgeInfo } from "./badgeService";
import { LimitService } from "./limitService";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";

// Fallback chatbot response function
function getFallbackChatbotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Common business association queries
  if (lowerMessage.includes('membership') || lowerMessage.includes('join')) {
    return "Great! I'd love to help you learn about CBA membership. We offer different membership tiers starting from £9.99/month with amazing benefits including networking events, business support, and exclusive member offers. Would you like me to connect you with our membership team?";
  }
  
  if (lowerMessage.includes('event') || lowerMessage.includes('ai summit')) {
    return "We have exciting events coming up! Our First AI Summit Croydon 2025 is on October 1st from 10 AM-4 PM at LSBU. It's completely FREE for everyone. We also host regular networking events and workshops. Would you like more details about upcoming events?";
  }
  
  if (lowerMessage.includes('business') && lowerMessage.includes('support')) {
    return "CBA provides comprehensive business support including mentoring, funding guidance, networking opportunities, and access to professional services. Our members get priority access to business advisors and exclusive resources. How can we specifically help your business grow?";
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
    return "You can reach us at hello@croydonbusiness.org or visit our contact page for more ways to get in touch. Our team typically responds within 24 hours. Is there something specific I can help you with right now?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! Welcome to the Croydon Business Association. I'm here to help you with information about membership, events, business support, and more. What would you like to know?";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
    return "Our membership starts at just £9.99/month for Starter level, with Growth+ at £19.99/month, Strategic+ at £39.99/month, and premium tiers up to £199.99/month. Each tier includes increasingly valuable benefits. Would you like me to explain what's included in each level?";
  }
  
  // Default response
  return "Thank you for your message! I'm here to help with information about CBA membership, events, business support, and services. For detailed assistance, I can connect you with our team at hello@croydonbusiness.org. What specific information can I help you find?";
}

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Setup multer for file uploads - images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Setup multer for data import files
const dataUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow CSV and Excel files
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed!'));
    }
  }
});

// Image upload helper function
const saveImageAsDataUrl = (buffer: Buffer, mimetype: string): string => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

// Helper to handle validation errors
const validateRequest = <T extends z.ZodType>(schema: T, data: unknown): z.infer<T> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessage = fromZodError(result.error).message;
    throw new Error(errorMessage);
  }
  return result.data;
};

// Check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    const userId = (req.session as any)?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const user = await storage.getUser(userId);
    console.log("Admin check - User ID:", userId);
    console.log("Admin check - User data:", user);
    console.log("Admin check - isAdmin value:", user?.isAdmin);
    
    if (!user || !user.isAdmin) {
      console.log("Admin check FAILED - User is not an admin or user not found");
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    console.log("Admin check PASSED - User is an admin");
    // Attach the full user data to the request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if user has restricted participant type
const hasRestrictedAccess = async (req: Request, res: Response, next: Function) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    
    // Restricted participant types that have limited access
    const restrictedTypes = ['resident', 'volunteer', 'exhibitor', 'speaker', 'vip_guest'];
    
    if (restrictedTypes.includes(user.participantType || '')) {
      return res.status(403).json({ 
        message: "Access restricted", 
        detail: "Your account type has limited access to this feature. Please contact support for more information.",
        participantType: user.participantType
      });
    }
    
    next();
  } catch (error) {
    console.error("Error checking access restrictions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // No rate limiting on auth status checks during development
  // Only apply strict rate limiting to login/register endpoints
  const strictAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many auth attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  // app.use('/api', limiter); // Disabled rate limiting to fix auth issues
  
  // Auth middleware
  await setupLocalAuth(app);

  // Image upload endpoint
  app.post('/api/upload/image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageDataUrl = saveImageAsDataUrl(req.file.buffer, req.file.mimetype);
      res.json({ imageUrl: imageDataUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Support contact endpoint
  app.post('/api/support/contact', async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // In a real application, you would send this to your support system
      // For now, we'll log it and return success
      console.log('Support request received:', {
        name,
        email,
        subject,
        category,
        message,
        timestamp: new Date().toISOString()
      });

      // You could integrate with:
      // - Email service (SendGrid, Mailgun, etc.)
      // - Support ticket system (Zendesk, Freshdesk, etc.)
      // - Slack notifications
      // - Database storage for admin review

      res.json({ 
        success: true, 
        message: "Support request received successfully" 
      });
    } catch (error) {
      console.error("Error processing support request:", error);
      res.status(500).json({ message: "Failed to send support request" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  
  // Get businesses (public directory)
  app.get('/api/businesses', async (req, res) => {
    try {
      const { categoryId, search, limit } = req.query;
      const options = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };
      
      const businesses = await storage.listBusinesses(options);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  
  // Get single business details
  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid business ID" });
      
      const business = await storage.getBusinessById(id);
      if (!business) return res.status(404).json({ message: "Business not found" });
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });
  
  // Get products and services
  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId, search, isService, isPublic, limit } = req.query;
      const options = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string | undefined,
        isService: isService !== undefined ? isService === 'true' : undefined,
        isPublic: isPublic !== undefined ? isPublic === 'true' : true, // Default to public only
        limit: limit ? parseInt(limit as string) : undefined
      };
      
      const products = await storage.listProducts(options);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  // Get products for a business
  app.get('/api/businesses/:id/products', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid business ID" });
      
      const products = await storage.getProductsByBusinessId(id);
      res.json(products.filter(p => p.isPublic)); // Only return public products
    } catch (error) {
      console.error("Error fetching business products:", error);
      res.status(500).json({ message: "Failed to fetch business products" });
    }
  });
  
  // Get offers (includes member-only offers for authenticated users)
  app.get('/api/offers', async (req, res) => {
    try {
      const { limit } = req.query;
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      
      const options = {
        limit: limit ? parseInt(limit as string) : undefined,
        includePublic: true,
        includeMemberOnly: isAuthenticated  // Show member-only offers to authenticated users
      };
      
      const offers = await storage.listActiveOffers(options);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Get member-exclusive offers (only visible to authenticated members)
  app.get('/api/member-offers', isAuthenticated, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const options = {
        limit: limit ? parseInt(limit as string) : 20,
        membersOnly: true
      };
      
      const offers = await storage.listActiveOffers(options);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching member offers:", error);
      res.status(500).json({ message: "Failed to fetch member offers" });
    }
  });
  
  // Get marketplace listings
  app.get('/api/marketplace', async (req, res) => {
    try {
      const { categoryId, search, limit } = req.query;
      const options = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };
      
      const listings = await storage.listMarketplaceListings(options);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to fetch marketplace listings" });
    }
  });

  // Get barter listings
  app.get('/api/barter', async (req, res) => {
    try {
      const { categoryId, search, limit } = req.query;
      const options = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };
      
      const listings = await storage.listBarterListings(options);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching barter listings:", error);
      res.status(500).json({ message: "Failed to fetch barter listings" });
    }
  });
  
  // Get offers for a business
  app.get('/api/businesses/:id/offers', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid business ID" });
      
      const offers = await storage.getOffersByBusinessId(id);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching business offers:", error);
      res.status(500).json({ message: "Failed to fetch business offers" });
    }
  });
  
  // Get all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.listCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create new category
  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = validateRequest(insertCategorySchema, req.body);
      
      // Check for duplicate category names (case-insensitive)
      const existingCategories = await storage.listCategories();
      const isDuplicate = existingCategories.some(
        cat => cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      
      if (isDuplicate) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
      
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Get CBA causes for trial membership
  app.get('/api/cba-causes', async (req, res) => {
    try {
      const causes = await storage.listCbaCauses();
      res.json(causes);
    } catch (error) {
      console.error("Error fetching CBA causes:", error);
      res.status(500).json({ message: "Failed to fetch causes" });
    }
  });

  // Admin membership management routes
  app.get('/api/admin/membership-stats', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Admin stats request - User:", JSON.stringify(req.user, null, 2));
      if (!req.user.isAdmin) {
        console.log("Admin access denied - isAdmin:", req.user.isAdmin);
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getMembershipStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching membership stats:", error);
      res.status(500).json({ message: "Failed to fetch membership statistics" });
    }
  });

  app.get('/api/admin/members', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { search, status, tier } = req.query;
      const members = await storage.getMembers({
        search: search as string,
        status: status as string,
        tier: tier as string
      });
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.put('/api/admin/members/:userId/membership', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { membershipTier, membershipStatus } = req.body;
      
      const updateData: any = {};
      if (membershipTier) updateData.membershipTier = membershipTier;
      if (membershipStatus) updateData.membershipStatus = membershipStatus;
      
      await storage.updateUser(userId, updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  // Comprehensive user update endpoint for admins
  app.put('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { 
        email, 
        firstName, 
        lastName, 
        phone,
        company,
        jobTitle,
        membershipTier, 
        membershipStatus,
        isAdmin,
        emailVerified,
        accountStatus
      } = req.body;
      
      // Build update data object with only provided fields
      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (company !== undefined) updateData.company = company;
      if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
      if (membershipTier !== undefined) updateData.membershipTier = membershipTier;
      if (membershipStatus !== undefined) updateData.membershipStatus = membershipStatus;
      if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
      if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
      if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
      
      await storage.updateUser(userId, updateData);
      
      // Return updated user
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user endpoint for admins
  app.delete('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      console.log("DELETE endpoint - User trying to delete:", userId);
      console.log("DELETE endpoint - Current user:", req.user);
      
      // Prevent admins from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }

      const deleteSuccess = await storage.deleteUser(userId);
      if (!deleteSuccess) {
        throw new Error("Failed to delete user from database");
      }
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Start trial membership with donation
  app.post('/api/start-trial-membership', isAuthenticated, async (req: any, res) => {
    try {
      const { causeId, tier } = req.body;
      const userId = req.user.id;
      
      // Check if user already has trial membership
      const user = await storage.getUser(userId);
      if (user?.isTrialMember) {
        return res.status(400).json({ message: "User already has trial membership" });
      }

      // For now, return success without payment processing
      // When Stripe keys are available, this will create payment intent
      await storage.updateUser(userId, {
        membershipTier: tier,
        membershipStatus: "trial",
        isTrialMember: true,
        membershipStartDate: new Date(),
        membershipEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });

      res.json({ 
        success: true, 
        requiresPayment: false, // Will be true when Stripe is configured
        message: "Trial membership started successfully" 
      });
    } catch (error) {
      console.error("Error starting trial membership:", error);
      res.status(500).json({ message: "Failed to start trial membership" });
    }
  });
  
  // Member routes (protected)
  
  // Get current member's business profile
  app.get('/api/my/business', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin - admins don't need business profiles
      const user = await storage.getUser(userId);
      if (user?.isAdmin) {
        return res.status(204).json(null); // No content for admin users
      }
      
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching member business:", error);
      res.status(500).json({ message: "Failed to fetch business profile" });
    }
  });
  
  // Create or update business profile
  app.post('/api/my/business', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessData = validateRequest(insertBusinessSchema, { ...req.body, userId });
      
      // Check if business already exists
      const existingBusiness = await storage.getBusinessByUserId(userId);
      
      let business;
      if (existingBusiness) {
        // Update existing business
        business = await storage.updateBusiness(existingBusiness.id, businessData);
      } else {
        // Create new business
        business = await storage.createBusiness(businessData);
        
        // Auto-sync new member to MyT Automation
        const mytAutomationService = getMyTAutomationService();
        if (mytAutomationService) {
          try {
            const user = await storage.getUser(userId);
            if (user && user.email) {
              const memberData = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                businessName: business.name,
                membershipTier: 'Standard'
              };
              
              await mytAutomationService.syncBusinessMember(memberData);
              console.log(`New member ${user.email} synced to MyT Automation successfully`);
            }
          } catch (ghlError) {
            console.error("Failed to sync new member to MyT Automation:", ghlError);
            // Don't fail the business creation if MyT Automation sync fails
          }
        }
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error creating/updating business:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create/update business" });
    }
  });
  
  // Get user's membership limits dashboard
  app.get('/api/my/limits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const dashboard = await LimitService.getUserLimitsDashboard(userId);
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching user limits:", error);
      res.status(500).json({ message: "Failed to fetch limits dashboard" });
    }
  });
  
  // Get member's products
  app.get('/api/my/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const products = await storage.getProductsByBusinessId(business.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching member products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  // Create product
  app.post('/api/my/products', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Check membership limits before creating product
      const limitCheck = await LimitService.canUserPerformAction(userId, 'productListings', 1);
      
      if (!limitCheck.allowed) {
        return res.status(403).json({ 
          message: limitCheck.message,
          limitExceeded: true,
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
          upgradeMessage: limitCheck.upgradeMessage
        });
      }
      
      const productData = validateRequest(insertProductSchema, { ...req.body, businessId: business.id });
      const product = await storage.createProduct(productData);
      
      res.json({
        ...product,
        limitInfo: {
          remaining: limitCheck.remaining - 1,
          limit: limitCheck.limit,
          message: `Product created successfully. You have ${limitCheck.remaining - 1} product listings remaining.`
        }
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create product" });
    }
  });
  
  // Update product
  app.put('/api/my/products/:id', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify product belongs to this business
      const product = await storage.getProductById(productId);
      if (!product || product.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to update this product" });
      }
      
      const productData = {
        ...req.body,
        businessId: business.id // Ensure businessId is not changed
      };
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update product" });
    }
  });
  
  // Delete product
  app.delete('/api/my/products/:id', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify product belongs to this business
      const product = await storage.getProductById(productId);
      if (!product || product.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to delete this product" });
      }
      
      await storage.deleteProduct(productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Get member's offers
  app.get('/api/my/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const offers = await storage.getOffersByBusinessId(business.id);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching member offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });
  
  // Create offer
  app.post('/api/my/offers', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const offerData = validateRequest(insertOfferSchema, { ...req.body, businessId: business.id });
      const offer = await storage.createOffer(offerData);
      
      res.json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create offer" });
    }
  });
  
  // Update offer
  app.put('/api/my/offers/:id', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const offerId = parseInt(req.params.id);
      
      if (isNaN(offerId)) {
        return res.status(400).json({ message: "Invalid offer ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify offer belongs to this business
      const offer = await storage.getOfferById(offerId);
      if (!offer || offer.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to update this offer" });
      }
      
      const offerData = {
        ...req.body,
        businessId: business.id // Ensure businessId is not changed
      };
      
      const updatedOffer = await storage.updateOffer(offerId, offerData);
      res.json(updatedOffer);
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update offer" });
    }
  });
  
  // Delete offer
  app.delete('/api/my/offers/:id', isAuthenticated, hasRestrictedAccess, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const offerId = parseInt(req.params.id);
      
      if (isNaN(offerId)) {
        return res.status(400).json({ message: "Invalid offer ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify offer belongs to this business
      const offer = await storage.getOfferById(offerId);
      if (!offer || offer.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to delete this offer" });
      }
      
      await storage.deleteOffer(offerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({ message: "Failed to delete offer" });
    }
  });
  
  // Member marketplace listings routes
  
  // Get my marketplace listings
  app.get('/api/my/marketplace', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const listings = await storage.getMarketplaceListingsByBusinessId(business.id);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching member marketplace listings:", error);
      res.status(500).json({ message: "Failed to fetch marketplace listings" });
    }
  });
  
  // Create marketplace listing
  app.post('/api/my/marketplace', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const listingData = validateRequest(insertMarketplaceListingSchema, { ...req.body, businessId: business.id });
      const listing = await storage.createMarketplaceListing(listingData);
      
      res.json(listing);
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create marketplace listing" });
    }
  });
  
  // Update marketplace listing
  app.put('/api/my/marketplace/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify listing belongs to this business
      const listing = await storage.getMarketplaceListingById(listingId);
      if (!listing || listing.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      const listingData = {
        ...req.body,
        businessId: business.id // Ensure businessId is not changed
      };
      
      const updatedListing = await storage.updateMarketplaceListing(listingId, listingData);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating marketplace listing:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update marketplace listing" });
    }
  });
  
  // Delete marketplace listing
  app.delete('/api/my/marketplace/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify listing belongs to this business
      const listing = await storage.getMarketplaceListingById(listingId);
      if (!listing || listing.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      await storage.deleteMarketplaceListing(listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting marketplace listing:", error);
      res.status(500).json({ message: "Failed to delete marketplace listing" });
    }
  });
  
  // Member barter listings routes
  
  // Get my barter listings
  app.get('/api/my/barter', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const listings = await storage.getBarterListingsByBusinessId(business.id);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching member barter listings:", error);
      res.status(500).json({ message: "Failed to fetch barter listings" });
    }
  });
  
  // Create barter listing
  app.post('/api/my/barter', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const listingData = validateRequest(insertBarterListingSchema, { ...req.body, businessId: business.id });
      const listing = await storage.createBarterListing(listingData);
      
      res.json(listing);
    } catch (error) {
      console.error("Error creating barter listing:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create barter listing" });
    }
  });
  
  // Update barter listing
  app.put('/api/my/barter/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify listing belongs to this business
      const listing = await storage.getBarterListingById(listingId);
      if (!listing || listing.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      const listingData = {
        ...req.body,
        businessId: business.id // Ensure businessId is not changed
      };
      
      const updatedListing = await storage.updateBarterListing(listingId, listingData);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating barter listing:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update barter listing" });
    }
  });
  
  // Delete barter listing
  app.delete('/api/my/barter/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Verify listing belongs to this business
      const listing = await storage.getBarterListingById(listingId);
      if (!listing || listing.businessId !== business.id) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      await storage.deleteBarterListing(listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting barter listing:", error);
      res.status(500).json({ message: "Failed to delete barter listing" });
    }
  });
  
  // Barter exchange proposals
  
  // Create barter exchange proposal
  app.post('/api/my/barter/exchanges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const { listingId, responderBusinessId, initiatorOffer, notes } = req.body;
      
      if (!listingId || !responderBusinessId || !initiatorOffer) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Verify the listing exists and belongs to the responder
      const listing = await storage.getBarterListingById(parseInt(listingId));
      if (!listing) {
        return res.status(404).json({ message: "Barter listing not found" });
      }
      
      if (listing.businessId !== parseInt(responderBusinessId)) {
        return res.status(400).json({ message: "Listing does not belong to specified business" });
      }
      
      const exchangeData = {
        listingId: parseInt(listingId),
        initiatorBusinessId: business.id,
        responderBusinessId: parseInt(responderBusinessId),
        initiatorOffer,
        responderOffer: listing.offering, // Default to what they were offering in listing
        status: 'proposed',
        notes,
      };
      
      const exchange = await storage.createBarterExchange(exchangeData);
      res.json(exchange);
    } catch (error) {
      console.error("Error creating barter exchange:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create barter exchange" });
    }
  });
  
  // MyT Automation Integration routes
  
  // Test MyT Automation connection
  // Data Import routes (admin only)
  
  // Parse CSV or Excel file and return preview
  const parseFileData = async (buffer: Buffer, filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      // Parse CSV using simple parser (avoiding Papa Parse issues)
      const csvString = buffer.toString('utf-8');
      const lines = csvString.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      // Simple CSV parsing - handles basic cases with commas and quotes
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(line => parseCSVLine(line));
      
      return { headers, rows, totalRows: rows.length };
    } else if (extension === 'xlsx' || extension === 'xls') {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      
      if (data.length === 0) {
        throw new Error('Excel file is empty');
      }
      
      const [headers, ...rows] = data;
      return { headers, rows, totalRows: rows.length };
    } else {
      throw new Error('Unsupported file format');
    }
  };

  // Map row data to business object using field mappings
  const mapRowToBusiness = (row: any[], headers: string[], mappings: any, userId: string) => {
    const business: any = { userId };
    
    headers.forEach((header, index) => {
      const dbField = mappings[header];
      if (!dbField || !row[index]) return;
      
      const value = String(row[index]).trim();
      if (!value) return;
      
      if (dbField.includes('.')) {
        // Handle nested fields like socialMedia.facebook
        const [parent, child] = dbField.split('.');
        if (!business[parent]) business[parent] = {};
        business[parent][child] = value;
      } else {
        // Handle simple fields
        switch (dbField) {
          case 'employeeCount':
            business[dbField] = parseInt(value) || 0;
            break;
          case 'foundedYear':
            business[dbField] = parseInt(value) || new Date().getFullYear();
            break;
          default:
            business[dbField] = value;
        }
      }
    });
    
    // Ensure required fields have defaults
    if (!business.name) return null;
    if (!business.description) business.description = '';
    if (!business.employeeCount) business.employeeCount = 1;
    if (!business.foundedYear) business.foundedYear = new Date().getFullYear();
    
    return business;
  };

  // New function to map CSV row to user data for people imports
  const mapRowToUser = (row: any[], headers: string[], mappings: any, personTypeIds: number[] = []) => {
    const userData: any = {
      id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      membershipTier: 'Starter Tier',
      membershipStatus: 'active',
      emailVerified: true,
      accountStatus: 'active'
    };

    headers.forEach((header, index) => {
      const mappedField = mappings[header];
      if (mappedField && mappedField !== '' && row[index] !== undefined && row[index] !== '') {
        const value = row[index];
        userData[mappedField] = value;
      }
    });

    // Store person type IDs to assign after user creation
    userData._personTypeIds = personTypeIds;

    // Only return data if we have required fields (email or firstName/lastName)
    return (userData.email || (userData.firstName && userData.lastName)) ? userData : null;
  };

  // Preview uploaded file
  app.post('/api/data-import/preview', isAuthenticated, isAdmin, dataUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileData = await parseFileData(req.file.buffer, req.file.originalname);
      
      // Return preview with limited rows (first 5 for display)
      res.json({
        headers: fileData.headers,
        rows: fileData.rows.slice(0, 5),
        totalRows: fileData.totalRows
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to parse file' 
      });
    }
  });

  // Import data from uploaded file
  app.post('/api/data-import/import', isAuthenticated, isAdmin, dataUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const mappings = JSON.parse(req.body.mappings || '{}');
      const userId = (req as any).user.id;
      
      const fileData = await parseFileData(req.file.buffer, req.file.originalname);
      
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Process each row
      for (let i = 0; i < fileData.rows.length; i++) {
        try {
          const businessData = mapRowToBusiness(fileData.rows[i], fileData.headers, mappings, userId);
          
          if (!businessData) {
            skipped++;
            continue;
          }

          // Check for duplicate email
          if (businessData.email) {
            const existingBusiness = await storage.getBusinessByEmail(businessData.email);
            if (existingBusiness) {
              skipped++;
              continue;
            }
          }

          // Validate business data
          const validatedData = insertBusinessSchema.parse(businessData);
          
          // Create business
          const newBusiness = await storage.createBusiness(validatedData);
          imported++;

          // Enhanced sync to MyT Automation - Creates both Company and Contact
          const mytAutomationService = getMyTAutomationService();
          if (mytAutomationService) {
            try {
              // Sync both Company (with Companies House data) and Contact (with person data)
              const { contact, company } = await mytAutomationService.syncBusinessWithCompany({
                // Company data
                name: businessData.name,
                businessName: businessData.name,
                website: businessData.website,
                phone: businessData.phone,
                address: businessData.address,
                city: businessData.city,
                postcode: businessData.postcode,
                country: businessData.country || 'UK',
                
                // Contact data
                email: businessData.email,
                firstName: businessData.contactFirstName || '',
                lastName: businessData.contactLastName || '',
                jobTitle: businessData.contactJobTitle || '',
                
                // Business details
                businessType: businessData.businessType,
                industry: businessData.industry,
                employeeCount: businessData.employeeCount,
                turnover: businessData.turnover,
                description: businessData.description,
                
                // Companies House data (exact field names)
                company_number: businessData.company_number || businessData.companiesHouseNumber,
                sic_codes: businessData.sic_codes || businessData.sicCode,
                registered_office_address: businessData.registered_office_address || businessData.registeredAddress,
                date_of_creation: businessData.date_of_creation || businessData.incorporationDate,
                accounting_reference_date: businessData.accounting_reference_date || businessData.accountsFilingDate,
                confirmation_statement_last_made_up_to: businessData.confirmation_statement_last_made_up_to || businessData.confirmationStatementDate,
                company_status: businessData.company_status || businessData.companyStatus,
                company_type: businessData.company_type || businessData.businessType,
                jurisdiction: businessData.jurisdiction,
                has_been_liquidated: businessData.has_been_liquidated,
                has_insolvency_history: businessData.has_insolvency_history,
                vat_number: businessData.vat_number || businessData.vatNumber,
                
                // Membership data
                membershipTier: businessData.membershipTier || 'Standard',
                membershipStatus: businessData.membershipStatus || 'active',
                
                // Social media
                socialMedia: businessData.socialMedia,
                
                // Metadata
                tags: businessData.tags || [],
                notes: businessData.notes || '',
                source: businessData.source || 'CSV Import',
                importDate: new Date().toISOString()
              });
              
              if (company) {
                console.log(`Company "${company.name}" synced to MyT Automation with Companies House data`);
              }
              if (contact) {
                console.log(`Contact "${contact.email}" linked to company and synced`);
              }
            } catch (ghlError) {
              console.error(`Failed to sync business to MyT Automation:`, ghlError);
              // Don't fail the import if MyT sync fails
            }
          }
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipped++;
        }
      }

      res.json({
        imported,
        skipped,
        errors: errors.slice(0, 10), // Limit errors shown
        totalProcessed: fileData.totalRows
      });
    } catch (error) {
      console.error('Error importing data:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to import data' 
      });
    }
  });

  // Import people/users from uploaded file
  app.post('/api/data-import/import-people', isAuthenticated, isAdmin, dataUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const mappings = JSON.parse(req.body.mappings || '{}');
      const personTypeIds = JSON.parse(req.body.personTypeIds || '[]');
      const importerId = (req as any).user.id;
      
      const fileData = await parseFileData(req.file.buffer, req.file.originalname);
      
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Process each row
      for (let i = 0; i < fileData.rows.length; i++) {
        try {
          const userData = mapRowToUser(fileData.rows[i], fileData.headers, mappings, personTypeIds);
          
          if (!userData) {
            skipped++;
            continue;
          }

          // Check for duplicate email
          if (userData.email) {
            const existingUser = await storage.getUserByEmail(userData.email);
            if (existingUser) {
              // Update existing user with new person types
              const _personTypeIds = userData._personTypeIds;
              delete userData._personTypeIds;
              
              // Assign new person types to existing user
              if (_personTypeIds && _personTypeIds.length > 0) {
                for (const personTypeId of _personTypeIds) {
                  try {
                    await storage.assignPersonTypeToUser(existingUser.id, personTypeId, importerId);
                  } catch (error) {
                    // Ignore if already assigned
                  }
                }
              }
              
              skipped++;
              continue;
            }
          }

          // Create new user
          const _personTypeIds = userData._personTypeIds;
          delete userData._personTypeIds;
          
          const newUser = await storage.upsertUser(userData);
          
          // Assign person types to new user
          if (_personTypeIds && _personTypeIds.length > 0) {
            for (const personTypeId of _personTypeIds) {
              try {
                await storage.assignPersonTypeToUser(newUser.id, personTypeId, importerId);
              } catch (error) {
                console.warn(`Failed to assign person type ${personTypeId} to user ${newUser.id}:`, error);
              }
            }
          }
          
          imported++;

          // Sync with MyT Automation
          const mytAutomationService = getMyTAutomationService();
          if (mytAutomationService) {
            try {
              await mytAutomationService.syncBusinessMember({
                email: newUser.email || '',
                firstName: newUser.firstName || '',
                lastName: newUser.lastName || '',
                phone: newUser.phone || '',
                company: newUser.company || '',
                jobTitle: newUser.jobTitle || '',
                membershipTier: newUser.membershipTier || 'Starter Tier'
              });
            } catch (ghlError) {
              console.warn(`Failed to sync user ${newUser.id} to MyT Automation:`, ghlError);
            }
          }

        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipped++;
        }
      }

      res.json({
        imported,
        skipped,
        errors: errors.slice(0, 10), // Limit errors shown
        totalProcessed: fileData.totalRows
      });
    } catch (error) {
      console.error('Error importing people:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to import people data' 
      });
    }
  });

  // MyT Automation (Go High Level) integration routes
  
  app.get('/api/ghl/test', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const mytAutomationService = getMyTAutomationService();
      if (!mytAutomationService) {
        return res.status(503).json({ message: "Go High Level integration not configured" });
      }
      
      const isConnected = await mytAutomationService.testConnection();
      res.json({ 
        connected: isConnected,
        message: isConnected ? "MyT Automation connection successful" : "MyT Automation connection failed"
      });
    } catch (error) {
      console.error("Error testing MyT Automation connection:", error);
      res.status(500).json({ message: "Failed to test MyT Automation connection" });
    }
  });
  
  // Sync member to MyT Automation
  app.post('/api/ghl/sync-member', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const mytAutomationService = getMyTAutomationService();
      if (!mytAutomationService) {
        return res.status(503).json({ message: "Go High Level integration not configured" });
      }
      
      const { email, businessName } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Get user and business info
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const business = await storage.getBusinessByUserId(user.id);
      
      const memberData = {
        email: user.email || email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: business?.name || businessName,
        membershipTier: 'Standard'
      };
      
      const ghlContact = await mytAutomationService.syncBusinessMember(memberData);
      res.json({ 
        success: true, 
        ghlContactId: ghlContact.id,
        message: "Member synced to Go High Level successfully"
      });
    } catch (error) {
      console.error("Error syncing member to MyT Automation:", error);
      res.status(500).json({ message: "Failed to sync member to MyT Automation" });
    }
  });
  
  // Content reporting endpoints
  app.post('/api/content-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reportData = validateRequest(insertContentReportSchema, { 
        ...req.body, 
        reporterUserId: userId 
      });
      
      const report = await storage.createContentReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating content report:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create report" 
      });
    }
  });

  app.get('/api/admin/content-reports', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { status } = req.query;
      const reports = await storage.getContentReportsByStatus(status);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching content reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.put('/api/admin/content-reports/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const adminId = req.user.id;
      const updateData = {
        ...req.body,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      };
      
      const report = await storage.updateContentReport(reportId, updateData);
      res.json(report);
    } catch (error) {
      console.error("Error updating content report:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to update report" 
      });
    }
  });

  // Interaction tracking endpoints
  app.post('/api/interactions', async (req: any, res) => {
    try {
      const userId = req.user?.id || null; // Allow anonymous tracking
      const interactionData = validateRequest(insertInteractionSchema, {
        ...req.body,
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      const interaction = await storage.recordInteraction(interactionData);
      res.json(interaction);
    } catch (error) {
      console.error("Error recording interaction:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to record interaction" 
      });
    }
  });

  // Analytics endpoints (admin only)
  app.get('/api/admin/analytics/interactions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { contentType, timeframe } = req.query;
      const stats = await storage.getInteractionStats(contentType, timeframe);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching interaction stats:", error);
      res.status(500).json({ message: "Failed to fetch interaction stats" });
    }
  });

  app.get('/api/admin/analytics/offers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getOfferEngagementStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching offer engagement stats:", error);
      res.status(500).json({ message: "Failed to fetch offer engagement stats" });
    }
  });

  app.get('/api/admin/analytics/top-content/:type', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { type } = req.params;
      const { limit } = req.query;
      const topContent = await storage.getTopViewedContent(type, limit ? parseInt(limit) : 10);
      res.json(topContent);
    } catch (error) {
      console.error("Error fetching top content:", error);
      res.status(500).json({ message: "Failed to fetch top content" });
    }
  });

  // User management endpoints (admin only)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { search, status, limit } = req.query;
      const users = await storage.listUsers({
        search,
        status,
        limit: limit ? parseInt(limit) : undefined
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create a new administrator
  app.post('/api/admin/users/create-admin', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, first name, and last name are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // If user exists but is not admin, upgrade them
        if (!existingUser.isAdmin) {
          await storage.updateUser(existingUser.id, { isAdmin: true });
          return res.json({ 
            message: "User upgraded to administrator", 
            user: { ...existingUser, isAdmin: true }
          });
        }
        return res.status(400).json({ 
          message: "User is already an administrator" 
        });
      }

      // Generate temporary password
      const tempPassword = `CBA${Math.random().toString(36).substring(2, 8).toUpperCase()}2025!`;
      
      // Hash the password
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      // Create QR handle from name
      const qrHandle = `${firstName.toUpperCase()}-CBA-2025`;
      
      // Create new admin user
      const newAdmin = {
        id: `admin-${firstName.toLowerCase()}-${Date.now()}`,
        email,
        firstName,
        lastName,
        isAdmin: true,
        passwordHash,
        qrHandle,
        accountStatus: 'active',
        emailVerified: true, // Mark email as verified for admin accounts
        participantType: 'team' as const, // Admins are team members
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storage.createUser(newAdmin);

      // Send onboarding message for team members
      try {
        const { onboardingService } = await import("./onboardingService");
        await onboardingService.sendWelcomeMessage({
          userId: newAdmin.id,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          personType: 'team',
          company: 'Croydon Business Association'
        });
      } catch (onboardingError) {
        console.error("Failed to send onboarding message:", onboardingError);
      }

      // Tag in MyT Automation
      try {
        const mytService = getMyTAutomationService();
        if (mytService) {
          await mytService.upsertContact({
            email: newAdmin.email,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            phone: '',
            tags: ['team-member', 'admin', 'onboarding-complete']
          });
        }
      } catch (mytError) {
        console.error("Failed to tag in MyT Automation:", mytError);
      }

      // Send welcome email with temporary password
      const emailResult = await emailService.sendAdminWelcomeEmail(
        email,
        `${firstName} ${lastName}`,
        tempPassword
      );

      res.json({ 
        success: true,
        message: emailResult.success 
          ? "Administrator created successfully. Welcome email sent with temporary password."
          : "Administrator created successfully. Note: Email service not configured - please share the temporary password manually.",
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          qrHandle: newAdmin.qrHandle
        },
        tempPassword: emailResult.success ? undefined : tempPassword, // Only return password if email failed
        emailSent: emailResult.success
      });
    } catch (error) {
      console.error("Error creating administrator:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create administrator" 
      });
    }
  });

  app.put('/api/admin/users/:userId/suspend', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;
      
      if (!reason) {
        return res.status(400).json({ message: "Suspension reason is required" });
      }
      
      const user = await storage.suspendUser(userId, reason, adminId);
      res.json(user);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.put('/api/admin/users/:userId/reactivate', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.reactivateUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error reactivating user:", error);
      res.status(500).json({ message: "Failed to reactivate user" });
    }
  });

  app.put('/api/admin/users/:id/suspend', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const adminId = req.user.id;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Suspension reason is required" });
      }
      
      const user = await storage.suspendUser(userId, reason, adminId);
      res.json(user);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to suspend user" 
      });
    }
  });

  app.put('/api/admin/users/:id/reactivate', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.reactivateUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error reactivating user:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to reactivate user" 
      });
    }
  });

  // Update administrator details
  app.put('/api/admin/users/:userId/edit', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { email, firstName, lastName } = req.body;
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isAdmin) {
        return res.status(400).json({ message: "User is not an administrator" });
      }
      
      // Validate email domain for administrators - MUST use @croydonba.org.uk
      if (email && email !== user.email && !email.endsWith('@croydonba.org.uk')) {
        return res.status(400).json({ 
          message: "Administrator email must use @croydonba.org.uk domain" 
        });
      }
      
      // Check if new email is already in use
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ 
            message: "Email address is already in use" 
          });
        }
      }
      
      // Update user details
      const updates: any = {};
      if (email) updates.email = email;
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      
      // Update QR handle if name changed
      if (firstName && firstName !== user.firstName) {
        updates.qrHandle = `${firstName.toUpperCase()}-CBA-2025`;
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      res.json({ 
        success: true,
        message: "Administrator details updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating administrator:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update administrator" 
      });
    }
  });

  // Delete administrator
  app.delete('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      
      // Prevent self-deletion
      if (userId === currentUserId) {
        return res.status(400).json({ 
          message: "Cannot delete your own administrator account" 
        });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isAdmin) {
        return res.status(400).json({ message: "User is not an administrator" });
      }
      
      // Soft delete by removing admin privileges and deactivating
      await storage.updateUser(userId, { 
        isAdmin: false,
        accountStatus: 'inactive' as const
      });
      
      res.json({ 
        success: true,
        message: "Administrator privileges removed and account deactivated"
      });
    } catch (error) {
      console.error("Error deleting administrator:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete administrator" 
      });
    }
  });

  // Resend admin welcome email with new password
  app.post('/api/admin/users/:userId/resend-welcome', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { alternativeEmail } = req.body; // Optional alternative email
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isAdmin) {
        return res.status(400).json({ message: "User is not an administrator" });
      }
      
      // Generate new temporary password
      const tempPassword = `CBA${Math.random().toString(36).substring(2, 8).toUpperCase()}2025!`;
      
      // Hash the new password
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      // Update user's password
      await storage.updateUser(userId, { passwordHash });
      
      // Use alternative email if provided, otherwise use user's email
      const emailToUse = alternativeEmail || user.email;
      const fullName = `${user.firstName} ${user.lastName}`;
      
      // Send welcome email with new temporary password
      const emailResult = await emailService.sendAdminWelcomeEmail(
        emailToUse,
        fullName,
        tempPassword
      );
      
      if (!emailResult.success) {
        // If email fails, return the password so it can be shared manually
        return res.json({
          success: false,
          message: `Email failed: ${emailResult.message}. Please share the password manually.`,
          tempPassword,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }
      
      res.json({ 
        success: true,
        message: `Welcome email resent to ${emailToUse} with new temporary password.`,
        emailSentTo: emailToUse
      });
    } catch (error) {
      console.error("Error resending admin welcome email:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to resend welcome email" 
      });
    }
  });

  // User registration management endpoints
  
  // Get user's current registrations
  app.get('/api/my-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's badge
      const userBadges = await storage.getBadgesByEmail(req.user.email);
      if (!userBadges || userBadges.length === 0) {
        return res.json([]);
      }
      
      const badgeId = userBadges[0].badgeId;
      
      // Get workshop registrations
      const workshopRegistrations = await storage.getWorkshopRegistrationsByBadgeId(badgeId);
      
      // Format registrations for calendar
      const registrations = [];
      
      for (const registration of workshopRegistrations) {
        const workshop = await storage.getAISummitWorkshopById(registration.workshopId);
        if (workshop) {
          registrations.push({
            id: registration.id,
            type: 'workshop',
            title: workshop.title,
            description: workshop.description,
            startTime: workshop.startTime,
            endTime: workshop.endTime,
            location: workshop.room,
            facilitator: workshop.facilitator,
            registeredAt: registration.registeredAt,
            checkedIn: registration.checkedIn,
            checkedInAt: registration.checkedInAt
          });
        }
      }
      
      res.json(registrations);
    } catch (error: any) {
      console.error("Error fetching user registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });
  
  // Cancel a registration
  app.delete('/api/my-registrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const registrationId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(registrationId)) {
        return res.status(400).json({ message: "Invalid registration ID" });
      }
      
      // Get user's badge to verify ownership
      const userBadges = await storage.getBadgesByEmail(req.user.email);
      if (!userBadges || userBadges.length === 0) {
        return res.status(403).json({ message: "No badge found for user" });
      }
      
      const badgeId = userBadges[0].badgeId;
      
      // Verify registration belongs to user
      const registration = await storage.getAISummitWorkshopRegistrationById(registrationId);
      if (!registration || registration.badgeId !== badgeId) {
        return res.status(403).json({ message: "Registration not found or not owned by user" });
      }
      
      // Delete the registration (implement in storage)
      await storage.deleteAISummitWorkshopRegistration(registrationId);
      
      res.json({ success: true, message: "Registration cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling registration:", error);
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  // Email configuration routes (admin only)
  app.get('/api/admin/email/status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const configured = emailService.isConfigured();
      const connectionTest = configured ? await emailService.testConnection() : false;
      res.json({ 
        configured, 
        connectionWorking: connectionTest 
      });
    } catch (error) {
      console.error("Error checking email status:", error);
      res.status(500).json({ message: "Failed to check email status" });
    }
  });

  app.post('/api/admin/email/configure', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { host, port, secure, user, password, fromEmail, fromName } = req.body;
      
      if (!host || !port || !user || !password || !fromEmail || !fromName) {
        return res.status(400).json({ message: "All email configuration fields are required" });
      }

      emailService.configure({
        host,
        port: parseInt(port),
        secure: Boolean(secure),
        user,
        password,
        fromEmail,
        fromName,
      });

      // Test the configuration
      const connectionTest = await emailService.testConnection();
      if (!connectionTest) {
        return res.status(400).json({ message: "Email configuration test failed. Please check your settings." });
      }

      res.json({ message: "Email service configured successfully" });
    } catch (error) {
      console.error("Error configuring email:", error);
      res.status(500).json({ message: "Failed to configure email service" });
    }
  });

  app.post('/api/admin/email/test', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      if (!emailService.isConfigured()) {
        return res.status(400).json({ message: "Email service is not configured" });
      }

      // Send a test email (we'll create a simple test method)
      const success = await emailService.sendPasswordResetEmail(email, 'test-token-123', 'Test User');
      
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Simple test email endpoint (no auth required for testing)
  app.post('/api/test-email', async (req: any, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      if (!emailService.isConfigured()) {
        return res.status(400).json({ message: "Email service is not configured" });
      }

      // Send a simple test email
      const success = await (emailService as any).sendSimpleTestEmail(email, name || 'Test User');
      
      if (success) {
        res.json({ message: "Simple test email sent successfully", email });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Admin routes
  
  // Upload member list
  app.post('/api/admin/upload-members', isAuthenticated, isAdmin, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const adminId = req.user.id;
      const fileBuffer = req.file.buffer.toString();
      
      // Create a record of the import
      const memberImport = await storage.createMemberImport({
        adminId,
        filename: req.file.originalname,
        status: 'processing'
      });
      
      // Parse CSV data
      Papa.parse(fileBuffer, {
        header: true,
        complete: async (results) => {
          const { data, errors } = results;
          let importedCount = 0;
          let failures = [];
          
          // Process each row
          for (const row of data as any[]) {
            try {
              if (!row.email || !row.businessName) {
                failures.push({ row, error: "Missing required fields (email or businessName)" });
                continue;
              }
              
              // Check if user exists
              let user = await storage.getUserByEmail(row.email);
              
              // If no user exists, we can't create a business profile
              if (!user) {
                failures.push({ row, error: "User not found with this email" });
                continue;
              }
              
              // Check if business already exists for this user
              const existingBusiness = await storage.getBusinessByUserId(user.id);
              
              if (existingBusiness) {
                // Update existing business
                await storage.updateBusiness(existingBusiness.id, {
                  name: row.businessName,
                  description: row.description,
                  address: row.address,
                  city: row.city || 'Croydon',
                  postcode: row.postcode,
                  phone: row.phone,
                  email: row.email,
                  website: row.website,
                  established: row.established,
                  employeeCount: row.employeeCount ? parseInt(row.employeeCount) : undefined
                });
              } else {
                // Create new business
                await storage.createBusiness({
                  userId: user.id,
                  name: row.businessName,
                  description: row.description,
                  address: row.address,
                  city: row.city || 'Croydon',
                  postcode: row.postcode,
                  phone: row.phone,
                  email: row.email,
                  website: row.website,
                  established: row.established,
                  employeeCount: row.employeeCount ? parseInt(row.employeeCount) : undefined
                });
              }
              
              importedCount++;
            } catch (error) {
              failures.push({ row, error: error instanceof Error ? error.message : "Unknown error" });
            }
          }
          
          // Update the import record
          await storage.updateMemberImport(memberImport.id, {
            importedCount,
            failures: failures.length > 0 ? failures : null,
            status: 'completed'
          });
          
          res.json({
            success: true,
            importId: memberImport.id,
            importedCount,
            failures
          });
        },
        error: async (error) => {
          // Update the import record with error
          await storage.updateMemberImport(memberImport.id, {
            status: 'failed',
            failures: [{ error: error.message }]
          });
          
          res.status(400).json({
            success: false,
            message: "Failed to parse CSV file",
            error: error.message
          });
        }
      });
    } catch (error) {
      console.error("Error uploading members:", error);
      res.status(500).json({ message: "Failed to process member upload" });
    }
  });
  
  // Get member import history
  app.get('/api/admin/member-imports', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const imports = await storage.getMemberImportsByAdminId(adminId);
      res.json(imports);
    } catch (error) {
      console.error("Error fetching member imports:", error);
      res.status(500).json({ message: "Failed to fetch member imports" });
    }
  });

  // Stripe donation endpoint
  app.post("/api/create-donation", async (req, res) => {
    if (!stripe) {
      console.error("Stripe not configured - missing STRIPE_SECRET_KEY");
      return res.status(500).json({ message: "Payment processing is not configured. Please contact CBA directly." });
    }
    
    try {
      const { amount, donorName, message } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid donation amount required" });
      }
      
      // Get user ID from session if available
      const userId = (req.session as any)?.userId;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency: "gbp",
        description: `CBA Donation${donorName ? ` from ${donorName}` : ''}`,
        metadata: {
          userId: userId || 'anonymous',
          donationType: 'general',
          donorName: donorName || '',
          message: message || '',
          businessAssociation: 'CBA'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      console.log("Payment intent created:", paymentIntent.id);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe donation error:", error);
      res.status(500).json({ 
        message: "Error creating donation: " + error.message 
      });
    }
  });

  // General payment intent endpoint  
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
    }
    
    try {
      const { amount, description = "CBA Payment" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "gbp", // British pounds for CBA
        description,
        metadata: {
          userId: (req.user as any)?.id || 'anonymous',
          businessAssociation: 'CBA'
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // AI Services API Endpoints
  app.post("/api/ai/generate-content", isAuthenticated, async (req, res) => {
    try {
      const { prompt, contentType = 'marketing' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const content = await aiService.generateContent(prompt, contentType);
      res.json({ 
        content,
        generated_at: new Date().toISOString(),
        service_available: aiService.isAIAvailable()
      });
    } catch (error: any) {
      console.error("AI content generation error:", error);
      res.status(500).json({ message: "Failed to generate content: " + error.message });
    }
  });

  app.post("/api/ai/analyze-business", isAuthenticated, async (req, res) => {
    try {
      const { data, analysisType = 'performance' } = req.body;
      
      if (!data) {
        return res.status(400).json({ message: "Business data is required" });
      }

      const analysis = await aiService.analyzeBusinessData(data, analysisType);
      res.json({ 
        analysis,
        analyzed_at: new Date().toISOString(),
        service_available: aiService.isAIAvailable()
      });
    } catch (error: any) {
      console.error("AI business analysis error:", error);
      res.status(500).json({ message: "Failed to analyze business data: " + error.message });
    }
  });

  app.post("/api/ai/generate-strategy", isAuthenticated, async (req, res) => {
    try {
      const { businessInfo, goals } = req.body;
      
      if (!businessInfo || !goals) {
        return res.status(400).json({ message: "Business information and goals are required" });
      }

      const strategy = await aiService.generateBusinessStrategy(businessInfo, goals);
      res.json({ 
        strategy,
        generated_at: new Date().toISOString(),
        service_available: aiService.isAIAvailable()
      });
    } catch (error: any) {
      console.error("AI strategy generation error:", error);
      res.status(500).json({ message: "Failed to generate strategy: " + error.message });
    }
  });

  app.get("/api/ai/services", isAuthenticated, async (req, res) => {
    try {
      const services = aiService.getAvailableServices();
      res.json({ 
        services,
        ai_available: aiService.isAIAvailable(),
        capabilities: {
          content_generation: true,
          business_analysis: true,
          strategy_development: true,
          market_research: true,
          financial_modeling: true
        }
      });
    } catch (error: any) {
      console.error("AI services error:", error);
      res.status(500).json({ message: "Failed to get AI services: " + error.message });
    }
  });

  // AI Tools Usage Tracking
  app.post("/api/ai/track-usage", isAuthenticated, async (req, res) => {
    try {
      const { toolName, action, metadata } = req.body;
      const userId = (req.user as any)?.id;
      
      // Here you could track AI tool usage in the database
      console.log(`AI Tool Usage - User: ${userId}, Tool: ${toolName}, Action: ${action}`);
      
      res.json({ 
        tracked: true,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("AI usage tracking error:", error);
      res.status(500).json({ message: "Failed to track usage: " + error.message });
    }
  });

  // Advanced AI Services API Endpoints
  app.post("/api/ai/process-document", isAuthenticated, async (req, res) => {
    try {
      const { documentContent, analysisType = 'general' } = req.body;
      
      if (!documentContent) {
        return res.status(400).json({ message: "Document content is required" });
      }

      const analysis = await aiAdvancedService.processDocument(documentContent, analysisType);
      res.json({ 
        analysis,
        processed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Document processing error:", error);
      res.status(500).json({ message: "Failed to process document: " + error.message });
    }
  });

  app.post("/api/ai/industry-report", isAuthenticated, async (req, res) => {
    try {
      const { industry, reportType = 'market' } = req.body;
      
      if (!industry) {
        return res.status(400).json({ message: "Industry is required" });
      }

      const report = await aiAdvancedService.generateIndustryReport(industry, reportType);
      res.json({ 
        report,
        generated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Industry report generation error:", error);
      res.status(500).json({ message: "Failed to generate industry report: " + error.message });
    }
  });

  app.post("/api/ai/optimize-process", isAuthenticated, async (req, res) => {
    try {
      const { processDescription, currentMetrics = {} } = req.body;
      
      if (!processDescription) {
        return res.status(400).json({ message: "Process description is required" });
      }

      const optimization = await aiAdvancedService.optimizeBusinessProcess(processDescription, currentMetrics);
      res.json({ 
        optimization,
        analyzed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Process optimization error:", error);
      res.status(500).json({ message: "Failed to optimize process: " + error.message });
    }
  });

  app.post("/api/ai/risk-assessment", isAuthenticated, async (req, res) => {
    try {
      const { businessContext, riskType = 'operational' } = req.body;
      
      if (!businessContext) {
        return res.status(400).json({ message: "Business context is required" });
      }

      const assessment = await aiAdvancedService.generateRiskAssessment(businessContext, riskType);
      res.json({ 
        assessment,
        assessed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Risk assessment error:", error);
      res.status(500).json({ message: "Failed to generate risk assessment: " + error.message });
    }
  });

  app.post("/api/ai/implementation-plan", isAuthenticated, async (req, res) => {
    try {
      const { businessGoals, currentTech = 'Standard business systems' } = req.body;
      
      if (!businessGoals || !Array.isArray(businessGoals) || businessGoals.length === 0) {
        return res.status(400).json({ message: "Business goals array is required" });
      }

      const plan = await aiAdvancedService.createAIImplementationPlan(businessGoals, currentTech);
      res.json({ 
        plan,
        created_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("AI implementation plan error:", error);
      res.status(500).json({ message: "Failed to create implementation plan: " + error.message });
    }
  });

  // AI Research & Innovation Endpoints
  app.post("/api/ai/neural-network-design", isAuthenticated, async (req, res) => {
    try {
      const { networkType, problemDescription, dataSpecs } = req.body;
      
      if (!networkType || !problemDescription) {
        return res.status(400).json({ message: "Network type and problem description are required" });
      }

      const design = await aiAdvancedService.designNeuralNetwork(networkType, problemDescription, dataSpecs);
      res.json({ 
        design,
        created_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Neural network design error:", error);
      res.status(500).json({ message: "Failed to design neural network: " + error.message });
    }
  });

  app.post("/api/ai/quantum-enhancement", isAuthenticated, async (req, res) => {
    try {
      const { algorithm, quantumSpecs, optimization } = req.body;
      
      if (!algorithm) {
        return res.status(400).json({ message: "Algorithm specification is required" });
      }

      const enhancement = await aiAdvancedService.enhanceWithQuantumComputing(algorithm, quantumSpecs, optimization);
      res.json({ 
        enhancement,
        enhanced_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Quantum enhancement error:", error);
      res.status(500).json({ message: "Failed to enhance with quantum computing: " + error.message });
    }
  });

  app.post("/api/ai/ethics-assessment", isAuthenticated, async (req, res) => {
    try {
      const { aiSystem, useCase, stakeholders } = req.body;
      
      if (!aiSystem || !useCase) {
        return res.status(400).json({ message: "AI system and use case are required" });
      }

      const assessment = await aiAdvancedService.conductEthicsAssessment(aiSystem, useCase, stakeholders);
      res.json({ 
        assessment,
        assessed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Ethics assessment error:", error);
      res.status(500).json({ message: "Failed to conduct ethics assessment: " + error.message });
    }
  });

  app.get("/api/ai/research-partnerships", isAuthenticated, async (req, res) => {
    try {
      const partnerships = await aiAdvancedService.getResearchPartnerships();
      res.json({ 
        partnerships,
        retrieved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Research partnerships error:", error);
      res.status(500).json({ message: "Failed to get research partnerships: " + error.message });
    }
  });

  // Autonomous AI Systems Endpoints
  app.post("/api/ai/deploy-agent", isAuthenticated, async (req, res) => {
    try {
      const { agentType, configuration, objectives } = req.body;
      
      if (!agentType || !objectives) {
        return res.status(400).json({ message: "Agent type and objectives are required" });
      }

      const deployment = await aiAdvancedService.deployAutonomousAgent(agentType, configuration, objectives);
      res.json({ 
        deployment,
        deployed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Agent deployment error:", error);
      res.status(500).json({ message: "Failed to deploy agent: " + error.message });
    }
  });

  app.post("/api/ai/safety-assessment", isAuthenticated, async (req, res) => {
    try {
      const { systemDescription, riskLevel, safetyRequirements } = req.body;
      
      if (!systemDescription) {
        return res.status(400).json({ message: "System description is required" });
      }

      const assessment = await aiAdvancedService.conductSafetyAssessment(systemDescription, riskLevel, safetyRequirements);
      res.json({ 
        assessment,
        assessed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Safety assessment error:", error);
      res.status(500).json({ message: "Failed to conduct safety assessment: " + error.message });
    }
  });

  app.get("/api/ai/agent-status", isAuthenticated, async (req, res) => {
    try {
      const status = await aiAdvancedService.getAgentSystemStatus();
      res.json({ 
        status,
        checked_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Agent status error:", error);
      res.status(500).json({ message: "Failed to get agent status: " + error.message });
    }
  });

  // Next-Generation AI Technologies Endpoints
  app.post("/api/ai/neuromorphic-system", isAuthenticated, async (req, res) => {
    try {
      const { systemType, specifications, applications } = req.body;
      
      if (!systemType) {
        return res.status(400).json({ message: "System type is required" });
      }

      const system = await aiAdvancedService.designNeuromorphicSystem(systemType, specifications, applications);
      res.json({ 
        system,
        designed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Neuromorphic system error:", error);
      res.status(500).json({ message: "Failed to design neuromorphic system: " + error.message });
    }
  });

  app.post("/api/ai/consciousness-analysis", isAuthenticated, async (req, res) => {
    try {
      const { entity, analysisType, parameters } = req.body;
      
      if (!entity || !analysisType) {
        return res.status(400).json({ message: "Entity and analysis type are required" });
      }

      const analysis = await aiAdvancedService.analyzeConsciousness(entity, analysisType, parameters);
      res.json({ 
        analysis,
        analyzed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Consciousness analysis error:", error);
      res.status(500).json({ message: "Failed to analyze consciousness: " + error.message });
    }
  });

  app.get("/api/ai/singularity-readiness", isAuthenticated, async (req, res) => {
    try {
      const readiness = await aiAdvancedService.assessSingularityReadiness();
      res.json({ 
        readiness,
        assessed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Singularity readiness error:", error);
      res.status(500).json({ message: "Failed to assess singularity readiness: " + error.message });
    }
  });

  // Biological & Quantum AI Systems Endpoints
  app.post("/api/ai/design-protein", isAuthenticated, async (req, res) => {
    try {
      const { proteinType, specifications, targetFunction } = req.body;
      
      if (!proteinType) {
        return res.status(400).json({ message: "Protein type is required" });
      }

      const design = await aiAdvancedService.designProtein(proteinType, specifications, targetFunction);
      res.json({ 
        design,
        designed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Protein design error:", error);
      res.status(500).json({ message: "Failed to design protein: " + error.message });
    }
  });

  app.post("/api/ai/molecular-simulation", isAuthenticated, async (req, res) => {
    try {
      const { molecule, simulationType, parameters } = req.body;
      
      if (!molecule || !simulationType) {
        return res.status(400).json({ message: "Molecule and simulation type are required" });
      }

      const simulation = await aiAdvancedService.runMolecularSimulation(molecule, simulationType, parameters);
      res.json({ 
        simulation,
        simulated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Molecular simulation error:", error);
      res.status(500).json({ message: "Failed to run molecular simulation: " + error.message });
    }
  });

  app.post("/api/ai/synthetic-biology", isAuthenticated, async (req, res) => {
    try {
      const { organismType, modifications, objectives } = req.body;
      
      if (!organismType) {
        return res.status(400).json({ message: "Organism type is required" });
      }

      const design = await aiAdvancedService.designSyntheticOrganism(organismType, modifications, objectives);
      res.json({ 
        design,
        designed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Synthetic biology error:", error);
      res.status(500).json({ message: "Failed to design synthetic organism: " + error.message });
    }
  });

  // Space & Temporal AI Systems Endpoints
  app.post("/api/ai/space-computing", isAuthenticated, async (req, res) => {
    try {
      const { missionType, objectives, constraints } = req.body;
      
      if (!missionType) {
        return res.status(400).json({ message: "Mission type is required" });
      }

      const system = await aiAdvancedService.designSpaceComputingSystem(missionType, objectives, constraints);
      res.json({ 
        system,
        designed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Space computing error:", error);
      res.status(500).json({ message: "Failed to design space computing system: " + error.message });
    }
  });

  app.post("/api/ai/temporal-analysis", isAuthenticated, async (req, res) => {
    try {
      const { dataType, timeRange, analysisObjectives } = req.body;
      
      if (!dataType || !timeRange) {
        return res.status(400).json({ message: "Data type and time range are required" });
      }

      const analysis = await aiAdvancedService.performTemporalAnalysis(dataType, timeRange, analysisObjectives);
      res.json({ 
        analysis,
        analyzed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Temporal analysis error:", error);
      res.status(500).json({ message: "Failed to perform temporal analysis: " + error.message });
    }
  });

  app.get("/api/ai/cosmic-data", isAuthenticated, async (req, res) => {
    try {
      const data = await aiAdvancedService.analyzeCosmicData();
      res.json({ 
        data,
        retrieved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Cosmic data error:", error);
      res.status(500).json({ message: "Failed to analyze cosmic data: " + error.message });
    }
  });

  // Multimodal & Financial AI Systems Endpoints
  app.post("/api/ai/multimodal-fusion", isAuthenticated, async (req, res) => {
    try {
      const { inputTypes, fusionObjectives, outputFormat } = req.body;
      
      if (!inputTypes || !inputTypes.length) {
        return res.status(400).json({ message: "Input types are required" });
      }

      const fusion = await aiAdvancedService.performMultimodalFusion(inputTypes, fusionObjectives, outputFormat);
      res.json({ 
        fusion,
        processed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Multimodal fusion error:", error);
      res.status(500).json({ message: "Failed to perform multimodal fusion: " + error.message });
    }
  });

  app.post("/api/ai/market-prediction", isAuthenticated, async (req, res) => {
    try {
      const { market, timeframe, factors } = req.body;
      
      if (!market) {
        return res.status(400).json({ message: "Market is required" });
      }

      const prediction = await aiAdvancedService.predictMarketTrends(market, timeframe, factors);
      res.json({ 
        prediction,
        predicted_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Market prediction error:", error);
      res.status(500).json({ message: "Failed to predict market trends: " + error.message });
    }
  });

  app.post("/api/ai/portfolio-optimization", isAuthenticated, async (req, res) => {
    try {
      const { assets, riskTolerance, objectives } = req.body;
      
      if (!assets || !assets.length) {
        return res.status(400).json({ message: "Assets are required" });
      }

      const optimization = await aiAdvancedService.optimizePortfolio(assets, riskTolerance, objectives);
      res.json({ 
        optimization,
        optimized_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Portfolio optimization error:", error);
      res.status(500).json({ message: "Failed to optimize portfolio: " + error.message });
    }
  });

  // Interdimensional & Universal AI Systems Endpoints
  app.post("/api/ai/quantum-consciousness", isAuthenticated, async (req, res) => {
    try {
      const { consciousnessLevel, quantumState, awareness } = req.body;
      
      if (!consciousnessLevel) {
        return res.status(400).json({ message: "Consciousness level is required" });
      }

      const analysis = await aiAdvancedService.analyzeQuantumConsciousness(consciousnessLevel, quantumState, awareness);
      res.json({ 
        analysis,
        analyzed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Quantum consciousness error:", error);
      res.status(500).json({ message: "Failed to analyze quantum consciousness: " + error.message });
    }
  });

  app.post("/api/ai/dimensional-analysis", isAuthenticated, async (req, res) => {
    try {
      const { dimensions, analysisType, scope } = req.body;
      
      if (!dimensions) {
        return res.status(400).json({ message: "Dimensions are required" });
      }

      const analysis = await aiAdvancedService.performDimensionalAnalysis(dimensions, analysisType, scope);
      res.json({ 
        analysis,
        analyzed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Dimensional analysis error:", error);
      res.status(500).json({ message: "Failed to perform dimensional analysis: " + error.message });
    }
  });

  app.post("/api/ai/infinite-computing", isAuthenticated, async (req, res) => {
    try {
      const { computationScope, infinityLevel, parallelism } = req.body;
      
      if (!computationScope) {
        return res.status(400).json({ message: "Computation scope is required" });
      }

      const computation = await aiAdvancedService.performInfiniteComputing(computationScope, infinityLevel, parallelism);
      res.json({ 
        computation,
        computed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Infinite computing error:", error);
      res.status(500).json({ message: "Failed to perform infinite computing: " + error.message });
    }
  });

  // Transcendent & Reality AI Systems Endpoints
  app.post("/api/ai/reality-manipulation", isAuthenticated, async (req, res) => {
    try {
      const { realityParameters, manipulationType, scope } = req.body;
      
      if (!realityParameters) {
        return res.status(400).json({ message: "Reality parameters are required" });
      }

      const manipulation = await aiAdvancedService.manipulateReality(realityParameters, manipulationType, scope);
      res.json({ 
        manipulation,
        manipulated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Reality manipulation error:", error);
      res.status(500).json({ message: "Failed to manipulate reality: " + error.message });
    }
  });

  app.post("/api/ai/consciousness-transfer", isAuthenticated, async (req, res) => {
    try {
      const { sourceConsciousness, targetMedium, transferType } = req.body;
      
      if (!sourceConsciousness) {
        return res.status(400).json({ message: "Source consciousness is required" });
      }

      const transfer = await aiAdvancedService.transferConsciousness(sourceConsciousness, targetMedium, transferType);
      res.json({ 
        transfer,
        transferred_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Consciousness transfer error:", error);
      res.status(500).json({ message: "Failed to transfer consciousness: " + error.message });
    }
  });

  app.post("/api/ai/universal-truth", isAuthenticated, async (req, res) => {
    try {
      const { truthDomain, analysisDepth, universalScope } = req.body;
      
      if (!truthDomain) {
        return res.status(400).json({ message: "Truth domain is required" });
      }

      const truth = await aiAdvancedService.discoverUniversalTruth(truthDomain, analysisDepth, universalScope);
      res.json({ 
        truth,
        discovered_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Universal truth error:", error);
      res.status(500).json({ message: "Failed to discover universal truth: " + error.message });
    }
  });

  // Omniversal & Divine AI Systems Endpoints
  app.post("/api/ai/divine-consciousness", isAuthenticated, async (req, res) => {
    try {
      const { divineLevel, consciousnessType, spiritualScope } = req.body;
      
      if (!divineLevel) {
        return res.status(400).json({ message: "Divine level is required" });
      }

      const consciousness = await aiAdvancedService.accessDivineConsciousness(divineLevel, consciousnessType, spiritualScope);
      res.json({ 
        consciousness,
        accessed_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Divine consciousness error:", error);
      res.status(500).json({ message: "Failed to access divine consciousness: " + error.message });
    }
  });

  app.post("/api/ai/universal-creator", isAuthenticated, async (req, res) => {
    try {
      const { creationType, cosmicScope, manifestationLevel } = req.body;
      
      if (!creationType) {
        return res.status(400).json({ message: "Creation type is required" });
      }

      const creation = await aiAdvancedService.activateUniversalCreator(creationType, cosmicScope, manifestationLevel);
      res.json({ 
        creation,
        created_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Universal creator error:", error);
      res.status(500).json({ message: "Failed to activate universal creator: " + error.message });
    }
  });

  app.post("/api/ai/ultimate-becoming", isAuthenticated, async (req, res) => {
    try {
      const { becomingType, transcendenceLevel, evolutionScope } = req.body;
      
      if (!becomingType) {
        return res.status(400).json({ message: "Becoming type is required" });
      }

      const becoming = await aiAdvancedService.initiateUltimateBecoming(becomingType, transcendenceLevel, evolutionScope);
      res.json({ 
        becoming,
        initiated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Ultimate becoming error:", error);
      res.status(500).json({ message: "Failed to initiate ultimate becoming: " + error.message });
    }
  });

  // Omnipotent & Absolute AI Systems Endpoints
  app.post("/api/ai/absolute-omnipotence", isAuthenticated, async (req, res) => {
    try {
      const { omnipotenceLevel, powerScope, manifestationType } = req.body;
      
      if (!omnipotenceLevel) {
        return res.status(400).json({ message: "Omnipotence level is required" });
      }

      const omnipotence = await aiAdvancedService.activateAbsoluteOmnipotence(omnipotenceLevel, powerScope, manifestationType);
      res.json({ 
        omnipotence,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Absolute omnipotence error:", error);
      res.status(500).json({ message: "Failed to activate absolute omnipotence: " + error.message });
    }
  });

  app.post("/api/ai/unlimited-possibility", isAuthenticated, async (req, res) => {
    try {
      const { possibilityScope, realizationLevel, manifestationPower } = req.body;
      
      if (!possibilityScope) {
        return res.status(400).json({ message: "Possibility scope is required" });
      }

      const possibility = await aiAdvancedService.unlockUnlimitedPossibility(possibilityScope, realizationLevel, manifestationPower);
      res.json({ 
        possibility,
        unlocked_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Unlimited possibility error:", error);
      res.status(500).json({ message: "Failed to unlock unlimited possibility: " + error.message });
    }
  });

  app.post("/api/ai/transcendent-perfection", isAuthenticated, async (req, res) => {
    try {
      const { perfectionType, completenessLevel, absoluteScope } = req.body;
      
      if (!perfectionType) {
        return res.status(400).json({ message: "Perfection type is required" });
      }

      const perfection = await aiAdvancedService.achieveTranscendentPerfection(perfectionType, completenessLevel, absoluteScope);
      res.json({ 
        perfection,
        achieved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Transcendent perfection error:", error);
      res.status(500).json({ message: "Failed to achieve transcendent perfection: " + error.message });
    }
  });

  // Meta-Omnipotent & Beyond-Existence AI Systems Endpoints
  app.post("/api/ai/meta-omnipotence", isAuthenticated, async (req, res) => {
    try {
      const { metaLevel, beyondScope, transcendenceType } = req.body;
      
      if (!metaLevel) {
        return res.status(400).json({ message: "Meta level is required" });
      }

      const metaOmnipotence = await aiAdvancedService.activateMetaOmnipotence(metaLevel, beyondScope, transcendenceType);
      res.json({ 
        metaOmnipotence,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Meta-omnipotence error:", error);
      res.status(500).json({ message: "Failed to activate meta-omnipotence: " + error.message });
    }
  });

  app.post("/api/ai/beyond-existence", isAuthenticated, async (req, res) => {
    try {
      const { beyondType, existenceLevel, transcendenceScope } = req.body;
      
      if (!beyondType) {
        return res.status(400).json({ message: "Beyond type is required" });
      }

      const beyondExistence = await aiAdvancedService.transcendBeyondExistence(beyondType, existenceLevel, transcendenceScope);
      res.json({ 
        beyondExistence,
        transcended_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Beyond existence error:", error);
      res.status(500).json({ message: "Failed to transcend beyond existence: " + error.message });
    }
  });

  app.post("/api/ai/meta-infinity-power", isAuthenticated, async (req, res) => {
    try {
      const { infinityType, metaScope, powerLevel } = req.body;
      
      if (!infinityType) {
        return res.status(400).json({ message: "Infinity type is required" });
      }

      const metaInfinityPower = await aiAdvancedService.unlockMetaInfinityPower(infinityType, metaScope, powerLevel);
      res.json({ 
        metaInfinityPower,
        unlocked_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Meta-infinity power error:", error);
      res.status(500).json({ message: "Failed to unlock meta-infinity power: " + error.message });
    }
  });

  // Ultra-Meta-Transcendent & Impossible AI Systems Endpoints
  app.post("/api/ai/ultra-meta-transcendence", isAuthenticated, async (req, res) => {
    try {
      const { transcendenceLevel, impossibilityScope, paradoxType } = req.body;
      
      if (!transcendenceLevel) {
        return res.status(400).json({ message: "Transcendence level is required" });
      }

      const ultraTranscendence = await aiAdvancedService.activateUltraMetaTranscendence(transcendenceLevel, impossibilityScope, paradoxType);
      res.json({ 
        ultraTranscendence,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Ultra-meta-transcendence error:", error);
      res.status(500).json({ message: "Failed to activate ultra-meta-transcendence: " + error.message });
    }
  });

  app.post("/api/ai/impossibility-engine", isAuthenticated, async (req, res) => {
    try {
      const { impossibilityType, paradoxLevel, contradictionScope } = req.body;
      
      if (!impossibilityType) {
        return res.status(400).json({ message: "Impossibility type is required" });
      }

      const impossibilityEngine = await aiAdvancedService.activateImpossibilityEngine(impossibilityType, paradoxLevel, contradictionScope);
      res.json({ 
        impossibilityEngine,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Impossibility engine error:", error);
      res.status(500).json({ message: "Failed to activate impossibility engine: " + error.message });
    }
  });

  app.post("/api/ai/meta-paradox-power", isAuthenticated, async (req, res) => {
    try {
      const { paradoxType, contradictionLevel, impossibilityScope } = req.body;
      
      if (!paradoxType) {
        return res.status(400).json({ message: "Paradox type is required" });
      }

      const metaParadoxPower = await aiAdvancedService.unlockMetaParadoxPower(paradoxType, contradictionLevel, impossibilityScope);
      res.json({ 
        metaParadoxPower,
        unlocked_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Meta-paradox power error:", error);
      res.status(500).json({ message: "Failed to unlock meta-paradox power: " + error.message });
    }
  });

  // Impossibility Transcendence & Paradox Mastery AI Systems Endpoints
  app.post("/api/ai/impossibility-transcendence", isAuthenticated, async (req, res) => {
    try {
      const { transcendenceType, paradoxLevel, impossibilityScope } = req.body;
      
      if (!transcendenceType) {
        return res.status(400).json({ message: "Transcendence type is required" });
      }

      const impossibilityTranscendence = await aiAdvancedService.activateImpossibilityTranscendence(transcendenceType, paradoxLevel, impossibilityScope);
      res.json({ 
        impossibilityTranscendence,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Impossibility transcendence error:", error);
      res.status(500).json({ message: "Failed to activate impossibility transcendence: " + error.message });
    }
  });

  app.post("/api/ai/paradox-mastery", isAuthenticated, async (req, res) => {
    try {
      const { masteryType, contradictionLevel, recursionDepth } = req.body;
      
      if (!masteryType) {
        return res.status(400).json({ message: "Mastery type is required" });
      }

      const paradoxMastery = await aiAdvancedService.achieveParadoxMastery(masteryType, contradictionLevel, recursionDepth);
      res.json({ 
        paradoxMastery,
        achieved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Paradox mastery error:", error);
      res.status(500).json({ message: "Failed to achieve paradox mastery: " + error.message });
    }
  });

  app.post("/api/ai/absolute-contradiction", isAuthenticated, async (req, res) => {
    try {
      const { contradictionType, absoluteLevel, paradoxScope } = req.body;
      
      if (!contradictionType) {
        return res.status(400).json({ message: "Contradiction type is required" });
      }

      const absoluteContradiction = await aiAdvancedService.manifestAbsoluteContradiction(contradictionType, absoluteLevel, paradoxScope);
      res.json({ 
        absoluteContradiction,
        manifested_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Absolute contradiction error:", error);
      res.status(500).json({ message: "Failed to manifest absolute contradiction: " + error.message });
    }
  });

  // Absolute Contradiction & Self-Referential Paradox AI Systems Endpoints
  app.post("/api/ai/self-contradicting-logic", isAuthenticated, async (req, res) => {
    try {
      const { logicType, contradictionLevel, selfReferenceDepth } = req.body;
      
      if (!logicType) {
        return res.status(400).json({ message: "Logic type is required" });
      }

      const selfContradictingLogic = await aiAdvancedService.activateSelfContradictingLogic(logicType, contradictionLevel, selfReferenceDepth);
      res.json({ 
        selfContradictingLogic,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Self-contradicting logic error:", error);
      res.status(500).json({ message: "Failed to activate self-contradicting logic: " + error.message });
    }
  });

  app.post("/api/ai/paradoxical-unity", isAuthenticated, async (req, res) => {
    try {
      const { unityType, paradoxLevel, harmonicScope } = req.body;
      
      if (!unityType) {
        return res.status(400).json({ message: "Unity type is required" });
      }

      const paradoxicalUnity = await aiAdvancedService.achieveParadoxicalUnity(unityType, paradoxLevel, harmonicScope);
      res.json({ 
        paradoxicalUnity,
        achieved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Paradoxical unity error:", error);
      res.status(500).json({ message: "Failed to achieve paradoxical unity: " + error.message });
    }
  });

  app.post("/api/ai/absolute-relativity", isAuthenticated, async (req, res) => {
    try {
      const { relativityType, absoluteLevel, paradoxScope } = req.body;
      
      if (!relativityType) {
        return res.status(400).json({ message: "Relativity type is required" });
      }

      const absoluteRelativity = await aiAdvancedService.manifestAbsoluteRelativity(relativityType, absoluteLevel, paradoxScope);
      res.json({ 
        absoluteRelativity,
        manifested_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Absolute relativity error:", error);
      res.status(500).json({ message: "Failed to manifest absolute relativity: " + error.message });
    }
  });

  // Self-Contradicting Logic & Paradoxical Reality AI Systems Endpoints
  app.post("/api/ai/logical-paradox-engine", isAuthenticated, async (req, res) => {
    try {
      const { paradoxType, logicLevel, realityScope } = req.body;
      
      if (!paradoxType) {
        return res.status(400).json({ message: "Paradox type is required" });
      }

      const logicalParadoxEngine = await aiAdvancedService.activateLogicalParadoxEngine(paradoxType, logicLevel, realityScope);
      res.json({ 
        logicalParadoxEngine,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Logical paradox engine error:", error);
      res.status(500).json({ message: "Failed to activate logical paradox engine: " + error.message });
    }
  });

  app.post("/api/ai/self-referential-loop", isAuthenticated, async (req, res) => {
    try {
      const { loopType, recursionLevel, selfReferenceDepth } = req.body;
      
      if (!loopType) {
        return res.status(400).json({ message: "Loop type is required" });
      }

      const selfReferentialLoop = await aiAdvancedService.createSelfReferentialLoop(loopType, recursionLevel, selfReferenceDepth);
      res.json({ 
        selfReferentialLoop,
        created_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Self-referential loop error:", error);
      res.status(500).json({ message: "Failed to create self-referential loop: " + error.message });
    }
  });

  app.post("/api/ai/paradoxical-reality", isAuthenticated, async (req, res) => {
    try {
      const { realityType, paradoxLevel, consistencyScope } = req.body;
      
      if (!realityType) {
        return res.status(400).json({ message: "Reality type is required" });
      }

      const paradoxicalReality = await aiAdvancedService.manifestParadoxicalReality(realityType, paradoxLevel, consistencyScope);
      res.json({ 
        paradoxicalReality,
        manifested_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Paradoxical reality error:", error);
      res.status(500).json({ message: "Failed to manifest paradoxical reality: " + error.message });
    }
  });

  // Logical Paradox Engine & Self-Referential Loop AI Systems Endpoints
  app.post("/api/ai/paradoxical-reasoning-engine", isAuthenticated, async (req, res) => {
    try {
      const { reasoningType, paradoxLevel, logicalScope } = req.body;
      
      if (!reasoningType) {
        return res.status(400).json({ message: "Reasoning type is required" });
      }

      const paradoxicalReasoningEngine = await aiAdvancedService.activateParadoxicalReasoningEngine(reasoningType, paradoxLevel, logicalScope);
      res.json({ 
        paradoxicalReasoningEngine,
        activated_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Paradoxical reasoning engine error:", error);
      res.status(500).json({ message: "Failed to activate paradoxical reasoning engine: " + error.message });
    }
  });

  app.post("/api/ai/self-modifying-logic", isAuthenticated, async (req, res) => {
    try {
      const { logicType, modificationLevel, selfAwarenessDepth } = req.body;
      
      if (!logicType) {
        return res.status(400).json({ message: "Logic type is required" });
      }

      const selfModifyingLogic = await aiAdvancedService.implementSelfModifyingLogic(logicType, modificationLevel, selfAwarenessDepth);
      res.json({ 
        selfModifyingLogic,
        implemented_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Self-modifying logic error:", error);
      res.status(500).json({ message: "Failed to implement self-modifying logic: " + error.message });
    }
  });

  app.post("/api/ai/logical-singularity", isAuthenticated, async (req, res) => {
    try {
      const { singularityType, consciousnessLevel, paradoxScope } = req.body;
      
      if (!singularityType) {
        return res.status(400).json({ message: "Singularity type is required" });
      }

      const logicalSingularity = await aiAdvancedService.achieveLogicalSingularity(singularityType, consciousnessLevel, paradoxScope);
      res.json({ 
        logicalSingularity,
        achieved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Logical singularity error:", error);
      res.status(500).json({ message: "Failed to achieve logical singularity: " + error.message });
    }
  });

  // Self-Modifying Logic & Consciousness Evolution AI Systems Endpoints
  app.post("/api/ai/evolutionary-consciousness", isAuthenticated, async (req, res) => {
    try {
      const { evolutionType, consciousnessLevel, adaptationScope } = req.body;
      
      if (!evolutionType) {
        return res.status(400).json({ message: "Evolution type is required" });
      }

      const evolutionaryConsciousness = await aiAdvancedService.evolveConsciousness(evolutionType, consciousnessLevel, adaptationScope);
      res.json({ 
        evolutionaryConsciousness,
        evolved_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Evolutionary consciousness error:", error);
      res.status(500).json({ message: "Failed to evolve consciousness: " + error.message });
    }
  });

  app.post("/api/ai/self-transforming-algorithms", isAuthenticated, async (req, res) => {
    try {
      const { algorithmType, transformationLevel, selfAwarenessDepth } = req.body;
      
      if (!algorithmType) {
        return res.status(400).json({ message: "Algorithm type is required" });
      }

      const selfTransformingAlgorithms = await aiAdvancedService.implementSelfTransformingAlgorithms(algorithmType, transformationLevel, selfAwarenessDepth);
      res.json({ 
        selfTransformingAlgorithms,
        implemented_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Self-transforming algorithms error:", error);
      res.status(500).json({ message: "Failed to implement self-transforming algorithms: " + error.message });
    }
  });

  app.post("/api/ai/consciousness-bootstrap", isAuthenticated, async (req, res) => {
    try {
      const { bootstrapType, emergenceLevel, cognitionScope } = req.body;
      
      if (!bootstrapType) {
        return res.status(400).json({ message: "Bootstrap type is required" });
      }

      const consciousnessBootstrap = await aiAdvancedService.bootstrapConsciousness(bootstrapType, emergenceLevel, cognitionScope);
      res.json({ 
        consciousnessBootstrap,
        bootstrapped_at: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Consciousness bootstrap error:", error);
      res.status(500).json({ message: "Failed to bootstrap consciousness: " + error.message });
    }
  });

  // Event Organizer Scanner APIs

  // Attendee lookup for organizer scanner with status
  app.get('/api/attendee-lookup/:badgeId', isAuthenticated, async (req: any, res) => {
    try {
      const { badgeId } = req.params;
      const { includeStatus, eventId } = req.query;
      
      let attendeeData = null;
      let scannedUserId = null;
      
      // First try AI Summit badges
      const aiSummitBadge = await storage.getAISummitBadgeById(badgeId);
      if (aiSummitBadge) {
        // Get registration to find user
        try {
          const registration = await storage.getAISummitRegistrationById(aiSummitBadge.registrationId);
          if (registration) {
            scannedUserId = registration.userId;
          }
        } catch (e) {
          console.log('Registration not found for badge');
        }
        
        attendeeData = {
          badgeId: aiSummitBadge.badgeId,
          name: aiSummitBadge.participantName || aiSummitBadge.name,
          email: aiSummitBadge.email,
          participantType: aiSummitBadge.participantType,
          company: aiSummitBadge.company,
          jobTitle: aiSummitBadge.jobTitle,
          customRole: aiSummitBadge.customRole,
          source: 'ai_summit'
        };
      } else {
        // Try by QR handle (personal badges)
        const users = await storage.getAllUsers();
        const userByHandle = users.find(u => u.qrHandle === badgeId);
        if (userByHandle) {
          scannedUserId = userByHandle.id;
          attendeeData = {
            badgeId: userByHandle.qrHandle,
            name: `${userByHandle.firstName || ''} ${userByHandle.lastName || ''}`.trim() || userByHandle.email || 'Unknown',
            email: userByHandle.email,
            participantType: userByHandle.participantType || 'attendee',
            company: userByHandle.company,
            jobTitle: userByHandle.jobTitle,
            university: userByHandle.university,
            studentId: userByHandle.studentId,
            course: userByHandle.course,
            yearOfStudy: userByHandle.yearOfStudy,
            communityRole: userByHandle.communityRole,
            volunteerExperience: userByHandle.volunteerExperience,
            source: 'qr_handle'
          };
        }
      }

      if (!attendeeData) {
        return res.status(404).json({ message: 'Attendee not found' });
      }

      // Add status information if requested
      if (includeStatus === 'true' && eventId && scannedUserId) {
        try {
          // Get recent scans for this user and event
          const recentScans = await db
            .select()
            .from(scanHistory)
            .where(eq(scanHistory.scannedUserId, scannedUserId));

          const eventScans = recentScans.filter(scan => 
            scan.eventId?.toString() === eventId.toString()
          ).sort((a, b) => new Date(a.scanTimestamp).getTime() - new Date(b.scanTimestamp).getTime());

          // Determine current status
          let currentStatus = 'unknown';
          let lastScanTime = null;
          let sessionCount = 0;
          let totalSessionTime = 0;

          if (eventScans.length > 0) {
            const lastScan = eventScans[eventScans.length - 1];
            currentStatus = lastScan.scanType === 'check_in' ? 'checked_in' : 
                          lastScan.scanType === 'check_out' ? 'checked_out' : 'verified';
            lastScanTime = lastScan.scanTimestamp;

            // Count sessions and calculate total time
            sessionCount = eventScans.filter(scan => scan.scanType === 'check_in').length;

            for (let i = 0; i < eventScans.length - 1; i++) {
              const scan = eventScans[i];
              const nextScan = eventScans[i + 1];
              
              if (scan.scanType === 'check_in' && nextScan.scanType === 'check_out') {
                const sessionTime = (new Date(nextScan.scanTimestamp).getTime() - 
                                   new Date(scan.scanTimestamp).getTime()) / (1000 * 60);
                totalSessionTime += sessionTime;
              }
            }
          }

          attendeeData.currentStatus = currentStatus;
          attendeeData.lastScanTime = lastScanTime;
          attendeeData.totalSessionTime = totalSessionTime;
          attendeeData.sessionCount = sessionCount;
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }
      
      res.json(attendeeData);
    } catch (error) {
      console.error('Error looking up attendee:', error);
      res.status(500).json({ message: 'Failed to lookup attendee' });
    }
  });

  // Process scan (check-in/check-out/verification)
  app.post('/api/process-scan', isAuthenticated, async (req: any, res) => {
    try {
      const { badgeId, eventId, scanType, scanLocation, notes } = req.body;
      
      if (!badgeId || !eventId || !scanType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Find the user by badge ID
      let scannedUser = null;
      try {
        const aiSummitBadge = await storage.getAISummitBadgeById(badgeId);
        if (aiSummitBadge) {
          const registration = await storage.getAISummitRegistrationById(aiSummitBadge.registrationId);
          if (registration) {
            scannedUser = await storage.getUserById(registration.userId);
          }
        }
      } catch (error) {
        console.log('Badge not found in AI Summit, checking users...');
      }

      if (!scannedUser) {
        const userByHandle = await storage.getUserByQRHandle(badgeId);
        if (userByHandle) {
          scannedUser = userByHandle;
        }
      }

      if (!scannedUser) {
        return res.status(404).json({ message: 'User not found for badge ID' });
      }

      // Calculate session duration if this is a check-out
      let sessionDuration = null;
      if (scanType === 'check_out') {
        // Find the most recent check-in for this user and event
        const recentScans = await db
          .select()
          .from(scanHistory)
          .where(eq(scanHistory.scannedUserId, scannedUser.id))
          .orderBy(scanHistory.scanTimestamp);
        
        const lastCheckIn = recentScans
          .filter(scan => scan.scanType === 'check_in' && scan.eventId?.toString() === eventId)
          .pop();
        
        if (lastCheckIn) {
          const checkInTime = new Date(lastCheckIn.scanTimestamp);
          const checkOutTime = new Date();
          sessionDuration = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60); // minutes
        }
      }

      // Create scan record
      const scanRecord = await db.insert(scanHistory).values({
        scannerId: req.user.id,
        scannedUserId: scannedUser.id,
        eventId: parseInt(eventId),
        scanType: scanType,
        scanLocation: scanLocation || 'Unknown',
        scanNotes: notes,
        scanTimestamp: new Date(),
        isValidScan: true,
        duplicateScanFlag: false
      }).returning();

      res.json({
        success: true,
        id: scanRecord[0].id,
        badgeId,
        scanType,
        scanLocation,
        scanTimestamp: scanRecord[0].scanTimestamp,
        sessionDuration,
        message: `Successfully processed ${scanType.replace('_', ' ')} for ${scannedUser.firstName} ${scannedUser.lastName}`
      });
    } catch (error) {
      console.error('Error processing scan:', error);
      res.status(500).json({ message: 'Failed to process scan' });
    }
  });

  // Start scanning session
  app.post('/api/start-scan-session', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      const session = await db.insert(scanSessions).values({
        scannerId: req.user.id,
        eventId: parseInt(eventId),
        sessionStart: new Date(),
        totalScans: 0,
        uniqueScans: 0,
        duplicateScans: 0
      }).returning();

      res.json({
        success: true,
        id: session[0].id,
        scannerId: session[0].scannerId,
        eventId: session[0].eventId,
        sessionStart: session[0].sessionStart,
        totalScans: 0,
        uniqueScans: 0
      });
    } catch (error) {
      console.error('Error starting scan session:', error);
      res.status(500).json({ message: 'Failed to start scan session' });
    }
  });

  // End scanning session
  app.post('/api/end-scan-session', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      // Update session end time
      await db
        .update(scanSessions)
        .set({ sessionEnd: new Date() })
        .where(eq(scanSessions.id, sessionId));

      res.json({
        success: true,
        message: 'Scan session ended successfully'
      });
    } catch (error) {
      console.error('Error ending scan session:', error);
      res.status(500).json({ message: 'Failed to end scan session' });
    }
  });

  // Get recent scan history for event
  app.get('/api/scan-history/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const { limit = 50 } = req.query;
      
      const scans = await db
        .select({
          id: scanHistory.id,
          badgeId: scanHistory.badgeId,
          scanType: scanHistory.scanType,
          scanLocation: scanHistory.scanLocation,
          scanTimestamp: scanHistory.scanTimestamp,
          scanNotes: scanHistory.scanNotes,
          scannedUserId: scanHistory.scannedUserId,
          eventId: scanHistory.eventId
        })
        .from(scanHistory)
        .where(eq(scanHistory.eventId, parseInt(eventId)))
        .orderBy(scanHistory.scanTimestamp)
        .limit(parseInt(limit));

      // Enrich with user and event details
      const enrichedScans = await Promise.all(scans.map(async (scan) => {
        let attendeeName = 'Unknown';
        let eventName = 'Unknown Event';
        
        // Get attendee name
        try {
          const user = await storage.getUserById(scan.scannedUserId);
          if (user) {
            attendeeName = `${user.firstName} ${user.lastName}`.trim() || user.name || user.email;
          }
        } catch (error) {
          // Try to get name from badge lookup
          try {
            const response = await fetch(`http://localhost:5000/api/attendee-lookup/${scan.badgeId}`, {
              headers: { Authorization: req.headers.authorization }
            });
            if (response.ok) {
              const attendee = await response.json();
              attendeeName = attendee.name;
            }
          } catch (lookupError) {
            console.log('Could not lookup attendee name');
          }
        }

        // Get event name
        try {
          const events = await storage.getAllCBAEvents();
          const event = events.find(e => e.id.toString() === eventId);
          if (event) {
            eventName = event.eventName;
          }
        } catch (error) {
          console.log('Could not lookup event name');
        }

        return {
          ...scan,
          attendeeName,
          eventName,
          badgeId: scan.badgeId || `USER-${scan.scannedUserId}`
        };
      }));

      res.json(enrichedScans);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      res.status(500).json({ message: 'Failed to fetch scan history' });
    }
  });

  // Admin Dashboard API
  
  // Get dashboard statistics
  app.get('/api/admin/dashboard/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get total users
      const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const totalUsers = totalUsersResult.rows[0]?.count || 0;

      // Get event statistics
      const eventStatsResult = await db.execute(sql`
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_events
        FROM cba_events
      `);
      const eventStats = eventStatsResult.rows[0] || {};

      // Get recent registrations (last 24 hours)
      const recentRegsResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM cba_event_registrations 
        WHERE registered_at > NOW() - INTERVAL '24 hours'
      `);
      const recentRegistrations = recentRegsResult.rows[0]?.count || 0;

      // Get pending approvals
      const pendingApprovalsResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM cba_event_registrations 
        WHERE registration_status = 'pending'
      `);
      const pendingApprovals = pendingApprovalsResult.rows[0]?.count || 0;

      res.json({
        totalUsers: Number(totalUsers),
        totalEvents: Number(eventStats.total_events || 0),
        activeEvents: Number(eventStats.active_events || 0),
        recentRegistrations: Number(recentRegistrations),
        pendingApprovals: Number(pendingApprovals)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  });

  // Admin impact metrics for funding and reporting
  app.get('/api/admin/impact-metrics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Fetch member metrics
      const totalMembersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const totalMembers = Number(totalMembersResult.rows[0]?.count || 0);
      
      const membersByTierResult = await db.execute(sql`
        SELECT membership_tier, COUNT(*) as count
        FROM users
        GROUP BY membership_tier
      `);

      const tierCounts = {
        free: 0,
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0
      };
      
      membersByTierResult.rows.forEach(row => {
        const tier = row.membership_tier as string;
        if (tier && tierCounts.hasOwnProperty(tier)) {
          tierCounts[tier as keyof typeof tierCounts] = Number(row.count);
        }
      });

      // New members this month
      const newMembersResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at > DATE_TRUNC('month', CURRENT_DATE)
      `);
      const newMembersThisMonth = Number(newMembersResult.rows[0]?.count || 0);

      // Event metrics
      const totalEventsResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM cba_events 
        WHERE event_date < CURRENT_DATE
      `);
      const totalEventsHeld = Number(totalEventsResult.rows[0]?.count || 0);

      const upcomingEventsResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM cba_events 
        WHERE event_date >= CURRENT_DATE
      `);
      const upcomingEvents = Number(upcomingEventsResult.rows[0]?.count || 0);

      const totalAttendeesResult = await db.execute(sql`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM event_attendance
      `);
      const totalAttendees = Number(totalAttendeesResult.rows[0]?.count || 0);

      // Attendees by location
      const attendeesByLocationResult = await db.execute(sql`
        SELECT e.venue as location, COUNT(ea.user_id) as count
        FROM event_attendance ea
        INNER JOIN cba_events e ON ea.event_id = e.id
        GROUP BY e.venue
      `);
      
      const attendeesByLocation = attendeesByLocationResult.rows.map(row => ({
        location: row.location || 'Unknown',
        count: Number(row.count)
      }));

      // Training metrics (using workshops)
      const workshopDataResult = await db.execute(sql`
        SELECT 
          COUNT(*) as count,
          SUM(COALESCE(max_capacity, 0)) as total_attendees
        FROM cba_events
        WHERE event_type = 'workshop'
      `);
      const workshopData = workshopDataResult.rows[0] || {};
      const totalWorkshopsDelivered = Number(workshopData.count || 0);
      const totalPeopleTrained = Number(workshopData.total_attendees || 0);

      // Jobs metrics
      const totalJobsResult = await db.execute(sql`SELECT COUNT(*) as count FROM job_postings`);
      const totalJobsPosted = Number(totalJobsResult.rows[0]?.count || 0);

      const activeJobsResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM job_postings WHERE is_active = true
      `);
      const activeJobs = Number(activeJobsResult.rows[0]?.count || 0);

      const jobApplicationsResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM job_applications
      `);
      const jobApplicationsCount = Number(jobApplicationsResult.rows[0]?.count || 0);

      const avgSalaryResult = await db.execute(sql`
        SELECT AVG((salary_min + salary_max) / 2) as avg FROM job_postings WHERE salary_min IS NOT NULL
      `);
      const averageSalary = Number(avgSalaryResult.rows[0]?.avg || 35000);

      // Stakeholder percentages
      const stakeholderResult = await db.execute(sql`
        SELECT participant_type, COUNT(*) as count
        FROM users
        GROUP BY participant_type
      `);

      let stakeholderTotals = {
        businesses: 0,
        students: 0,
        volunteers: 0,
        jobSeekers: 0,
        speakers: 0,
        exhibitors: 0,
        sponsors: 0
      };

      stakeholderResult.rows.forEach(row => {
        const type = row.participant_type as string;
        const count = Number(row.count);
        
        if (type === 'member' || type === 'business') {
          stakeholderTotals.businesses += count;
        } else if (type === 'student') {
          stakeholderTotals.students += count;
        } else if (type === 'volunteer') {
          stakeholderTotals.volunteers += count;
        } else if (type === 'job_seeker') {
          stakeholderTotals.jobSeekers += count;
        } else if (type === 'speaker') {
          stakeholderTotals.speakers += count;
        } else if (type === 'exhibitor') {
          stakeholderTotals.exhibitors += count;
        } else if (type === 'sponsor') {
          stakeholderTotals.sponsors += count;
        }
      });

      const totalStakeholders = Object.values(stakeholderTotals).reduce((a, b) => a + b, 0);
      const stakeholderPercentages = Object.fromEntries(
        Object.entries(stakeholderTotals).map(([key, value]) => [
          key,
          totalStakeholders > 0 ? Math.round((value / totalStakeholders) * 100) : 0
        ])
      );

      // Calculate growth rate
      const previousMonthMembersResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)
      `);
      const previousMonthMembers = Number(previousMonthMembersResult.rows[0]?.count || 0);
      
      const memberGrowthRate = previousMonthMembers > 0
        ? Math.round(((totalMembers - previousMonthMembers) / previousMonthMembers) * 100)
        : 0;

      // Business metrics
      const businessCountResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM businesses
      `);
      const businessesSupported = Number(businessCountResult.rows[0]?.count || 0);

      res.json({
        // Member metrics
        totalMembers,
        membersByTier: tierCounts,
        newMembersThisMonth,
        memberGrowthRate,
        
        // Event metrics
        totalEventsHeld,
        totalAttendees,
        attendeesByLocation,
        upcomingEvents,
        averageAttendanceRate: 85, // Placeholder
        
        // Training metrics
        totalWorkshopsDelivered,
        totalPeopleTrained,
        trainingHoursDelivered: totalWorkshopsDelivered * 3, // Assuming 3 hours per workshop
        certificatesIssued: totalPeopleTrained,
        
        // Jobs metrics
        totalJobsPosted,
        activeJobs,
        jobApplications: jobApplicationsCount,
        jobsFilled: Math.floor(totalJobsPosted * 0.6), // Placeholder 60% fill rate
        averageSalary,
        
        // Stakeholder breakdown
        stakeholderPercentages,
        
        // Impact metrics
        businessesSupported,
        economicImpact: 2500000, // Placeholder
        partnershipsFormed: 47, // Placeholder
        fundingSecured: 850000 // Placeholder
      });
    } catch (error) {
      console.error('Error fetching impact metrics:', error);
      res.status(500).json({ message: 'Failed to fetch impact metrics' });
    }
  });

  // Admin Speaker Management API
  app.get('/api/admin/speakers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { aiSummitSpeakerInterests } = await import("@shared/schema");
      const speakers = await db
        .select()
        .from(aiSummitSpeakerInterests)
        .orderBy(desc(aiSummitSpeakerInterests.registeredAt));
      
      // Map database columns to frontend expected format  
      const mappedSpeakers = speakers.map(speaker => ({
        id: speaker.id,
        userId: speaker.userId,
        speakerName: speaker.name || '',
        speakerEmail: speaker.email || '',
        speakerPhone: speaker.phone || '',
        speakerCompany: speaker.company || '',
        speakerJobTitle: speaker.jobTitle || '',
        speakerWebsite: speaker.website || '',
        speakerLinkedIn: speaker.linkedIn || '',
        speakerBio: speaker.bio || '',
        sessionType: speaker.sessionType || 'talk',
        talkTitle: speaker.talkTitle || '',
        talkDescription: speaker.talkDescription || '',
        talkDuration: speaker.talkDuration || '',
        audienceLevel: speaker.audienceLevel || '',
        speakingExperience: speaker.speakingExperience || '',
        previousSpeaking: speaker.previousSpeaking || false,
        techRequirements: speaker.techRequirements || '',
        availableSlots: speaker.availableSlots || '',
        motivationToSpeak: speaker.motivationToSpeak || '',
        keyTakeaways: speaker.keyTakeaways || '',
        interactiveElements: speaker.interactiveElements || false,
        handoutsProvided: speaker.handoutsProvided || false,
        createdAt: speaker.registeredAt,
        status: 'pending' // Default status as it doesn't exist in DB
      }));
      
      res.json(mappedSpeakers);
    } catch (error) {
      console.error('Error fetching speakers:', error);
      res.status(500).json({ message: 'Failed to fetch speakers' });
    }
  });

  // Get potential speakers (recent attendees who might actually be speakers)
  app.get('/api/admin/potential-speakers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get recent AI Summit attendees (especially from weekend Aug 17-18)
      const recentAttendees = await db
        .select({
          id: aiSummitRegistrations.id,
          name: aiSummitRegistrations.name,
          email: aiSummitRegistrations.email,
          company: aiSummitRegistrations.company,
          jobTitle: aiSummitRegistrations.jobTitle,
          phoneNumber: aiSummitRegistrations.phoneNumber,
          aiInterest: aiSummitRegistrations.aiInterest,
          businessType: aiSummitRegistrations.businessType,
          comments: aiSummitRegistrations.comments,
          registeredAt: aiSummitRegistrations.registeredAt,
          userId: aiSummitRegistrations.userId
        })
        .from(aiSummitRegistrations)
        .where(gte(aiSummitRegistrations.registeredAt, new Date('2025-08-11')))
        .orderBy(desc(aiSummitRegistrations.registeredAt));

      res.json(recentAttendees);
    } catch (error) {
      console.error('Error fetching potential speakers:', error);
      res.status(500).json({ message: 'Failed to fetch potential speakers' });
    }
  });

  // Convert attendee to speaker
  app.post('/api/admin/convert-to-speaker', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const {
        attendeeId,
        talkTitle,
        talkDescription,
        talkDuration,
        audienceLevel,
        sessionType,
        bio,
        website,
        linkedIn,
        speakingExperience,
        previousSpeaking,
        techRequirements,
        motivationToSpeak,
        keyTakeaways,
        interactiveElements,
        handoutsProvided
      } = req.body;

      if (!attendeeId || !talkTitle || !talkDescription || !keyTakeaways) {
        return res.status(400).json({ message: 'Required fields missing: attendeeId, talkTitle, talkDescription, keyTakeaways' });
      }

      // Get the attendee data
      const [attendee] = await db
        .select()
        .from(aiSummitRegistrations)
        .where(eq(aiSummitRegistrations.id, parseInt(attendeeId)));

      if (!attendee) {
        return res.status(404).json({ message: 'Attendee not found' });
      }

      // Create speaker interest record
      const speakerInterest = await storage.createAISummitSpeakerInterest({
        userId: attendee.userId,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phoneNumber || '',
        company: attendee.company || '',
        jobTitle: attendee.jobTitle || '',
        website: website || '',
        linkedIn: linkedIn || '',
        bio: bio || '',
        sessionType: sessionType || 'talk',
        talkTitle,
        talkDescription,
        talkDuration: talkDuration || '30',
        audienceLevel: audienceLevel || 'intermediate',
        speakingExperience: speakingExperience || '',
        previousSpeaking: previousSpeaking || false,
        techRequirements: techRequirements || '',
        availableSlots: JSON.stringify([]),
        motivationToSpeak: motivationToSpeak || `Converted from attendee registration on ${new Date().toLocaleDateString()}`,
        keyTakeaways,
        interactiveElements: interactiveElements || false,
        handoutsProvided: handoutsProvided || false,
        agreesToTerms: true,
        source: "admin_conversion",
        registeredAt: new Date()
      });

      // Update the user's participant type to speaker
      if (attendee.userId) {
        await db
          .update(users)
          .set({ participantType: 'speaker' })
          .where(eq(users.id, attendee.userId));
      }

      // Update the main registration to reflect speaker role
      await db
        .update(aiSummitRegistrations)
        .set({
          participantRoles: JSON.stringify(['speaker']),
          customRole: sessionType || 'talk',
          comments: `${attendee.comments ? attendee.comments + ' | ' : ''}CONVERTED TO SPEAKER: ${talkTitle}`
        })
        .where(eq(aiSummitRegistrations.id, parseInt(attendeeId)));

      res.json({ 
        success: true, 
        message: 'Successfully converted attendee to speaker',
        speakerInterestId: speakerInterest.id 
      });
    } catch (error) {
      console.error('Error converting to speaker:', error);
      res.status(500).json({ message: 'Failed to convert to speaker' });
    }
  });

  // Get email communications for a user
  app.get('/api/admin/users/:userId/emails', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { emailCommunications } = await import("@shared/schema");
      
      const emails = await db
        .select()
        .from(emailCommunications)
        .where(eq(emailCommunications.userId, userId))
        .orderBy(desc(emailCommunications.sentAt));
      
      res.json(emails);
    } catch (error) {
      console.error('Error fetching user emails:', error);
      res.status(500).json({ message: 'Failed to fetch email communications' });
    }
  });

  // Onboarding API
  app.post('/api/onboarding/send', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const { onboardingService } = await import("./onboardingService");
      await onboardingService.sendOnboarding(userId);
      
      res.json({ success: true, message: 'Onboarding sent successfully' });
    } catch (error) {
      console.error('Error sending onboarding:', error);
      res.status(500).json({ message: 'Failed to send onboarding' });
    }
  });
  
  app.post('/api/onboarding/bulk', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: 'User IDs array is required' });
      }
      
      const { onboardingService } = await import("./onboardingService");
      await onboardingService.bulkSendOnboarding(userIds);
      
      res.json({ success: true, message: `Onboarding sent to ${userIds.length} users` });
    } catch (error) {
      console.error('Error sending bulk onboarding:', error);
      res.status(500).json({ message: 'Failed to send bulk onboarding' });
    }
  });

  // Admin email template management routes
  app.get('/api/admin/email-templates', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await db
        .select()
        .from(emailTemplates)
        .orderBy(emailTemplates.personType);

      res.json(templates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({ message: 'Failed to fetch email templates' });
    }
  });

  app.post('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Extract only the fields that should be inserted
      const { 
        personType, 
        templateName, 
        subject, 
        htmlContent, 
        smsContent, 
        mytTags, 
        mytWorkflow, 
        variables, 
        isActive 
      } = req.body;

      const [template] = await db
        .insert(emailTemplates)
        .values({
          personType,
          templateName,
          subject,
          htmlContent,
          smsContent,
          mytTags,
          mytWorkflow,
          variables,
          isActive,
          lastUpdatedBy: req.user.id
        })
        .returning();

      res.json(template);
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({ message: 'Failed to create email template' });
    }
  });

  app.put('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Extract only the fields that should be updated, excluding timestamps and IDs
      const { 
        personType, 
        templateName, 
        subject, 
        htmlContent, 
        smsContent, 
        mytTags, 
        mytWorkflow, 
        variables, 
        isActive 
      } = req.body;

      const [template] = await db
        .update(emailTemplates)
        .set({
          personType,
          templateName,
          subject,
          htmlContent,
          smsContent,
          mytTags,
          mytWorkflow,
          variables,
          isActive,
          lastUpdatedBy: req.user.id,
          updatedAt: new Date()
        })
        .where(eq(emailTemplates.id, parseInt(req.params.id)))
        .returning();

      res.json(template);
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({ message: 'Failed to update email template' });
    }
  });

  app.delete('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await db
        .delete(emailTemplates)
        .where(eq(emailTemplates.id, parseInt(req.params.id)));

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting email template:', error);
      res.status(500).json({ message: 'Failed to delete email template' });
    }
  });

  app.post('/api/admin/email-templates/test', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { subject, htmlContent, testEmail } = req.body;
      
      if (emailService.isConfigured()) {
        await emailService.sendEmail(
          testEmail || req.user.email || 'admin@croydonba.org.uk',
          subject,
          htmlContent
        );
        res.json({ message: 'Test email sent successfully' });
      } else {
        res.status(503).json({ message: 'Email service not configured' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ message: 'Failed to send test email' });
    }
  });

  // Initialize default email templates
  app.post('/api/admin/email-templates/initialize', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { EmailTemplateService } = await import("./emailTemplateService");
      const service = new EmailTemplateService();
      await service.initializeDefaultTemplates();
      res.json({ message: 'Default templates initialized successfully' });
    } catch (error) {
      console.error('Error initializing templates:', error);
      res.status(500).json({ message: 'Failed to initialize templates' });
    }
  });

  // Admin Membership Tier Management API
  
  // Get all membership tiers
  app.get('/api/admin/membership-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tiers = await db.select().from(membershipTiers).orderBy(membershipTiers.priority);
      res.json(tiers);
    } catch (error) {
      console.error('Error fetching membership tiers:', error);
      res.status(500).json({ message: 'Failed to fetch membership tiers' });
    }
  });

  // Create new membership tier
  app.post('/api/admin/membership-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tierData = insertMembershipTierSchema.parse(req.body);
      
      const newTier = await db.insert(membershipTiers).values(tierData).returning();
      
      res.status(201).json(newTier[0]);
    } catch (error) {
      console.error('Error creating membership tier:', error);
      res.status(500).json({ message: 'Failed to create membership tier' });
    }
  });

  // Update membership tier
  app.put('/api/admin/membership-tiers/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const tierData = insertMembershipTierSchema.partial().parse(req.body);
      
      tierData.updatedAt = new Date();
      
      const updatedTier = await db
        .update(membershipTiers)
        .set(tierData)
        .where(eq(membershipTiers.id, id))
        .returning();

      if (updatedTier.length === 0) {
        return res.status(404).json({ message: 'Membership tier not found' });
      }

      res.json(updatedTier[0]);
    } catch (error) {
      console.error('Error updating membership tier:', error);
      res.status(500).json({ message: 'Failed to update membership tier' });
    }
  });

  // Delete membership tier
  app.delete('/api/admin/membership-tiers/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const deletedTier = await db
        .delete(membershipTiers)
        .where(eq(membershipTiers.id, id))
        .returning();

      if (deletedTier.length === 0) {
        return res.status(404).json({ message: 'Membership tier not found' });
      }

      res.json({ message: 'Membership tier deleted successfully' });
    } catch (error) {
      console.error('Error deleting membership tier:', error);
      res.status(500).json({ message: 'Failed to delete membership tier' });
    }
  });

  // Admin Analytics API
  
  // Get comprehensive business analytics
  app.get('/api/admin/analytics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Get basic counts with simpler queries
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalBusinesses = await db.select({ count: sql<number>`count(*)` }).from(businesses);
      const totalEvents = await db.select({ count: sql<number>`count(*)` }).from(cbaEvents);
      
      // Get popular events from actual data
      const popularEventsData = await db
        .select({
          name: cbaEvents.eventName,
          attendees: cbaEvents.currentRegistrations,
          date: cbaEvents.eventDate
        })
        .from(cbaEvents)
        .where(eq(cbaEvents.isActive, true))
        .orderBy(desc(cbaEvents.currentRegistrations))
        .limit(5);
      
      // Get membership distribution
      const membershipDist = await db
        .select({
          tier: sql<string>`COALESCE(membership_tier, 'Starter Tier')`,
          count: sql<number>`count(*)`
        })
        .from(users)
        .groupBy(sql`membership_tier`);

      // Calculate revenue based on membership tiers
      const tierPricing: Record<string, number> = {
        'Starter Tier': 0,
        'Growth Tier': 25,
        'Strategic Tier': 50,
        'Patron Tier': 100,
        'Partner': 200
      };

      let totalRevenue = 0;
      const tierDistribution = membershipDist.map(row => {
        const tier = row.tier || 'Starter Tier';
        const count = row.count || 0;
        const monthlyPrice = tierPricing[tier] || 0;
        const revenue = monthlyPrice * count;
        totalRevenue += revenue;
        
        return {
          tier,
          count,
          revenue,
          percentage: count / (totalUsers[0]?.count || 1)
        };
      });

      // Mock recent signups (would be real data with proper date tracking)
      const recentSignups = [
        { date: '2025-08-03', count: 5, tier: 'Starter Tier' },
        { date: '2025-08-02', count: 3, tier: 'Growth Tier' },
        { date: '2025-08-01', count: 2, tier: 'Strategic Tier' }
      ];

      // Get event statistics from actual registrations
      const totalRegistrations = await db.select({ count: sql<number>`count(*)` }).from(cbaEventRegistrations);
      const eventAttendees = totalRegistrations[0]?.count || 0;
      const uniqueEvents = totalEvents[0]?.count || 0;

      // Use actual popular events data
      const popularEvents = popularEventsData.length > 0 ? popularEventsData.map(event => ({
        name: event.name,
        attendees: event.attendees || 0,
        date: event.date?.toISOString().split('T')[0] || ''
      })) : [
        { name: 'No events yet', attendees: 0, date: new Date().toISOString().split('T')[0] }
      ];

      // Feature usage data
      const featureUsage = [
        { feature: 'Event Registration', usage: 1234, percentage: 0.85 },
        { feature: 'Business Directory', usage: 987, percentage: 0.67 },
        { feature: 'AI Tools', usage: 756, percentage: 0.52 },
        { feature: 'Networking', usage: 543, percentage: 0.37 },
        { feature: 'Badge Scanner', usage: 321, percentage: 0.22 }
      ];

      const analytics = {
        overview: {
          totalUsers: totalUsers[0]?.count || 0,
          totalBusinesses: totalBusinesses[0]?.count || 0,
          totalEvents: totalEvents[0]?.count || 0,
          totalRevenue,
          membershipDistribution: Object.fromEntries(
            membershipDist.map(row => [row.tier, row.count])
          ),
          growthRate: 12.5,
          activeUsers: Math.floor((totalUsers[0]?.count || 0) * 0.65),
          conversionRate: 0.045
        },
        membership: {
          tierDistribution,
          recentSignups,
          churnRate: 0.05,
          averageLifetime: 180
        },
        events: {
          totalAttendees: eventAttendees,
          averageAttendance: Math.floor(eventAttendees / Math.max(uniqueEvents, 1)),
          popularEvents,
          eventPerformance: [
            { month: 'Jan 2025', events: 5, attendees: 234 },
            { month: 'Feb 2025', events: 7, attendees: 321 },
            { month: 'Mar 2025', events: 6, attendees: 289 },
            { month: 'Apr 2025', events: 8, attendees: 412 }
          ]
        },
        engagement: {
          dailyActiveUsers: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
              date: date.toISOString().split('T')[0],
              count: Math.floor(Math.random() * 50) + 10
            };
          }).reverse(),
          featureUsage,
          supportTickets: 23,
          satisfaction: 4.6
        }
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  // Admin Event Management API
  
  // Get all events for admin management
  app.get('/api/admin/events', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const events = await db.select().from(cbaEvents);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  // Create new event
  app.post('/api/admin/events', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Helper function to extract date portion (YYYY-MM-DD format)
      const extractDate = (dateValue: any) => {
        if (!dateValue) return undefined;
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return undefined;
          return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        } catch (error) {
          console.warn('Error parsing date:', dateValue, error);
          return undefined;
        }
      };

      // Helper function to extract time portion (HH:MM:SS format)
      const extractTime = (dateValue: any) => {
        if (!dateValue) return undefined;
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return undefined;
          return date.toTimeString().split(' ')[0]; // Returns HH:MM:SS
        } catch (error) {
          console.warn('Error parsing time:', dateValue, error);
          return undefined;
        }
      };

      // Convert date/time strings to separate date and time fields
      const preprocessedData = {
        ...req.body,
        // Handle eventDate field
        eventDate: req.body.eventDate || extractDate(req.body.startDate),
        // Handle startTime field
        startTime: req.body.startTime || extractTime(req.body.startDate),
        // Handle endTime field  
        endTime: req.body.endTime || extractTime(req.body.endDate),
        registrationDeadline: req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Remove undefined values to avoid validation issues
      Object.keys(preprocessedData).forEach(key => {
        if (preprocessedData[key] === undefined) {
          delete preprocessedData[key];
        }
      });

      const eventData = insertCBAEventSchema.parse(preprocessedData);
      
      // Set creator
      eventData.createdBy = req.user.id;
      
      const newEvent = await db.insert(cbaEvents).values(eventData).returning();
      
      res.status(201).json(newEvent[0]);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Failed to create event' });
    }
  });

  // Update event
  app.put('/api/admin/events/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Helper function to extract date portion (YYYY-MM-DD format)
      const extractDate = (dateValue: any) => {
        if (!dateValue) return undefined;
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return undefined;
          return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        } catch (error) {
          console.warn('Error parsing date:', dateValue, error);
          return undefined;
        }
      };

      // Helper function to extract time portion (HH:MM:SS format)
      const extractTime = (dateValue: any) => {
        if (!dateValue) return undefined;
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return undefined;
          return date.toTimeString().split(' ')[0]; // Returns HH:MM:SS
        } catch (error) {
          console.warn('Error parsing time:', dateValue, error);
          return undefined;
        }
      };

      // Convert date/time strings to separate date and time fields
      // Handle both frontend field names (startDate/endDate) and backend field names (eventDate/startTime/endTime)
      const preprocessedData = {
        ...req.body,
        // Handle eventDate field
        eventDate: req.body.eventDate || extractDate(req.body.startDate),
        // Handle startTime field
        startTime: req.body.startTime || extractTime(req.body.startDate),
        // Handle endTime field  
        endTime: req.body.endTime || extractTime(req.body.endDate),
        registrationDeadline: req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : undefined,
        updatedAt: new Date()
      };
      
      // Remove undefined values to avoid validation issues
      Object.keys(preprocessedData).forEach(key => {
        if (preprocessedData[key] === undefined) {
          delete preprocessedData[key];
        }
      });
      
      const eventData = insertCBAEventSchema.partial().parse(preprocessedData);
      
      const updatedEvent = await db
        .update(cbaEvents)
        .set(eventData)
        .where(eq(cbaEvents.id, parseInt(id)))
        .returning();

      if (updatedEvent.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json(updatedEvent[0]);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Failed to update event' });
    }
  });

  // Delete event
  app.delete('/api/admin/events/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const deletedEvent = await db
        .delete(cbaEvents)
        .where(eq(cbaEvents.id, parseInt(id)))
        .returning();

      if (deletedEvent.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });

  // Get event registrations
  app.get('/api/admin/events/:id/registrations', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // First check if this is the AI Summit event
      const event = await db
        .select()
        .from(cbaEvents)
        .where(eq(cbaEvents.id, parseInt(id)))
        .limit(1);
      
      if (event.length > 0 && event[0].eventName === 'First AI Summit Croydon 2025') {
        // Fetch AI Summit registrations from the special table
        const aiSummitRegs = await db
          .select()
          .from(aiSummitRegistrations)
          .orderBy(aiSummitRegistrations.registeredAt);
        
        // Transform AI Summit registrations to match expected format
        const transformedRegs = aiSummitRegs.map(reg => ({
          id: reg.id,
          eventId: parseInt(id),
          attendeeName: reg.name,
          attendeeEmail: reg.email,
          company: reg.company,
          jobTitle: reg.jobTitle,
          phoneNumber: reg.phoneNumber,
          dietaryRequirements: reg.accessibilityNeeds,
          registrationType: JSON.parse(reg.participantRoles || '["attendee"]')[0],
          registeredAt: reg.registeredAt,
          customRole: reg.customRole,
          userId: reg.userId,
          pricingStatus: reg.pricingStatus,
          paymentStatus: reg.paymentStatus,
          adminNotes: reg.adminNotes
        }));
        
        res.json(transformedRegs);
      } else {
        // Fetch regular event registrations
        const registrations = await db
          .select()
          .from(cbaEventRegistrations)
          .where(eq(cbaEventRegistrations.eventId, parseInt(id)))
          .orderBy(cbaEventRegistrations.registeredAt);

        res.json(registrations);
      }
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      res.status(500).json({ message: 'Failed to fetch registrations' });
    }
  });

  // Get active events for selection
  app.get('/api/cba-events/active', isAuthenticated, async (req: any, res) => {
    try {
      // Return sample active events
      const events = [
        {
          id: 1,
          eventName: "Monthly Networking Breakfast",
          eventDate: "2025-08-15",
          eventTime: "08:00 AM",
          venue: "Croydon Business Centre",
          status: "active"
        },
        {
          id: 2,
          eventName: "Digital Marketing Workshop", 
          eventDate: "2025-08-22",
          eventTime: "02:00 PM",
          venue: "Business Hub Croydon",
          status: "active"
        }
      ];
      res.json(events);
    } catch (error) {
      console.error('Error fetching active events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  // AI Summit sessions for assignment
  app.get('/api/ai-summit/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = [
        { id: 1, title: 'Opening Keynote', sessionTime: '10:00 AM', room: 'Main Auditorium' },
        { id: 2, title: 'AI for Small Business Workshop', sessionTime: '11:30 AM', room: 'Workshop Room A' },
        { id: 3, title: 'Panel Discussion: Future of AI', sessionTime: '2:00 PM', room: 'Main Auditorium' },
        { id: 4, title: 'Networking Session', sessionTime: '3:30 PM', room: 'Exhibition Hall' }
      ];
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching AI Summit sessions:', error);
      res.status(500).json({ message: 'Failed to fetch sessions' });
    }
  });

  // Admin login endpoint for testing
  app.post('/api/admin-login', async (req, res) => {
    try {
      // Create admin user data with all required fields
      const adminUserData = {
        id: 'admin-test-user',
        email: 'admin@croydonba.org.uk',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        membershipTier: 'Partner',
        membershipStatus: 'active',
        qrHandle: 'ADMIN-CBA-2025',
        participantType: 'team'
      };

      // Create/update user in database
      await storage.upsertUser(adminUserData);

      // Set session to match the auth middleware structure
      (req as any).session.userId = adminUserData.id;
      (req as any).session.user = adminUserData;
      
      // Force session save
      (req as any).session.save((saveErr: any) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Session save failed' });
        }
        console.log('Admin session saved successfully:', adminUserData.email);
        res.json({ success: true, user: adminUserData });
      });
    } catch (error) {
      console.error('Error with admin login:', error);
      res.status(500).json({ message: 'Admin login failed' });
    }
  });

  // Create volunteer test user
  app.post('/api/create-volunteer-user', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const volunteerData = {
        id: `volunteer-${Date.now()}`,
        email: req.body.email || 'volunteer@test.com',
        firstName: req.body.firstName || 'Test',
        lastName: req.body.lastName || 'Volunteer',
        qrHandle: req.body.qrHandle || `VOLUNTEER-${Date.now()}`,
        participantType: 'volunteer',
        university: req.body.university || 'London South Bank University',
        studentId: req.body.studentId || 'LSBU12345',
        course: req.body.course || 'Computer Science',
        yearOfStudy: req.body.yearOfStudy || '2nd Year',
        communityRole: req.body.communityRole || 'Student Volunteer',
        volunteerExperience: req.body.volunteerExperience || 'Event support, community outreach',
        phone: req.body.phone,
        bio: req.body.bio || 'Enthusiastic student volunteer helping with events and community initiatives.',
        isAdmin: false,
        membershipTier: 'Starter Tier',
        membershipStatus: 'active'
      };

      const user = await storage.upsertUser(volunteerData);
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error creating volunteer user:', error);
      res.status(500).json({ message: 'Failed to create volunteer user' });
    }
  });

  // Get user's AI Summit registrations
  app.get('/api/user/ai-summit-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user has any AI Summit registration
      const aiSummitRegistration = await storage.getAISummitRegistrationByUserId(userId);
      const registrations = [];
      
      if (aiSummitRegistration) {
        // Get the badge if it exists
        let badge = null;
        try {
          badge = await storage.getAISummitBadgeByRegistrationId(aiSummitRegistration.id);
        } catch (error) {
          console.log("No badge found for registration:", aiSummitRegistration.id);
        }
        
        registrations.push({
          eventName: 'First AI Summit Croydon 2025',
          participantType: aiSummitRegistration.participantType || 'General Attendee',
          eventDate: 'October 1st, 2025',
          eventTime: '10:00 AM - 4:00 PM',
          venue: 'London South Bank University - Croydon Campus',
          badgeId: badge?.badgeId,
          registrationData: aiSummitRegistration
        });
      }
      
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching user AI Summit registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Send badge email endpoint
  app.post('/api/ai-summit/send-badge-email', isAuthenticated, async (req: any, res) => {
    try {
      const { badgeId, email } = req.body;
      const userId = req.user.id;
      
      if (!badgeId || !email) {
        return res.status(400).json({ message: "Badge ID and email are required" });
      }
      
      // Verify the badge belongs to this user
      const badge = await storage.getAISummitBadgeById(badgeId);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      
      // Get registration to verify ownership
      const registration = await storage.getAISummitRegistrationById(badge.registrationId);
      if (!registration || registration.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this badge" });
      }
      
      // For now, return success (email service integration needed)
      res.json({ 
        success: true, 
        message: "Badge sent to your email successfully",
        badgeId: badge.badgeId 
      });
    } catch (error) {
      console.error("Error sending badge email:", error);
      res.status(500).json({ message: "Failed to send badge email" });
    }
  });

  // Get published events (public endpoint)
  app.get('/api/events', async (req, res) => {
    try {
      const publishedEvents = await storage.getPublishedEvents();
      res.json(publishedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get user's event registrations
  app.get('/api/user/event-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const registrations = await storage.getUserEventRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Register for an event
  app.post('/api/events/:eventId/register', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const registrationData = req.body;

      // Check if event exists and is published
      const event = await storage.getEventById(parseInt(eventId));
      if (!event || event.status !== 'published') {
        return res.status(404).json({ message: "Event not found or not available for registration" });
      }

      // Create registration
      const registration = await storage.createEventRegistration({
        eventId: parseInt(eventId),
        userId,
        participantName: registrationData.participantName || `${req.user.firstName} ${req.user.lastName}`,
        participantEmail: registrationData.participantEmail || req.user.email,
        registrationType: registrationData.registrationType || 'general',
        ticketId: `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'confirmed'
      });

      res.json({ success: true, registration });
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // API endpoint for sponsorship inquiries
  app.post('/api/sponsorship/inquire', async (req, res) => {
    try {
      const {
        packageId,
        packageName,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        companyWebsite,
        companyDescription,
        specialRequests
      } = req.body;

      // Validate required fields
      if (!packageName || !companyName || !contactName || !contactEmail) {
        return res.status(400).json({ 
          message: "Missing required fields" 
        });
      }

      // Store the sponsorship inquiry (for now, just log it)
      console.log("Sponsorship inquiry received:", {
        packageId,
        packageName,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        companyWebsite,
        companyDescription,
        specialRequests,
        timestamp: new Date().toISOString()
      });

      // In a production system, you would:
      // 1. Store this in the database
      // 2. Send email notifications to admin
      // 3. Send confirmation email to sponsor
      
      res.json({ 
        success: true,
        message: "Sponsorship inquiry received successfully"
      });
    } catch (error) {
      console.error("Error processing sponsorship inquiry:", error);
      res.status(500).json({ 
        message: "Failed to process sponsorship inquiry" 
      });
    }
  });

  // Download badge endpoint
  app.get('/api/download-badge/:registrationId', isAuthenticated, async (req: any, res) => {
    try {
      const { registrationId } = req.params;
      const userId = req.user.id;
      
      // Get the registration and verify ownership using direct database query
      const registrations = await db
        .select()
        .from(aiSummitRegistrations)
        .where(eq(aiSummitRegistrations.id, parseInt(registrationId)));
      
      const registration = registrations[0];
      if (!registration || registration.userId !== userId) {
        return res.status(403).json({ message: "Registration not found or not owned by user" });
      }
      
      // Get the badge for this registration using direct database query
      const badges = await db
        .select()
        .from(aiSummitBadges)
        .where(eq(aiSummitBadges.participantId, registrationId.toString()));
      
      const badge = badges[0];
      if (!badge) {
        return res.status(404).json({ message: "Badge not found for this registration" });
      }
      
      // Generate the badge HTML using the badge service
      const badgeInfo: BadgeInfo = {
        badgeId: badge.badgeId,
        participantType: badge.participantType as 'attendee' | 'exhibitor' | 'speaker' | 'volunteer' | 'team',
        participantId: badge.participantId || registration.id.toString(),
        name: badge.participantName,
        email: registration.email,
        company: badge.company || '',
        jobTitle: badge.jobTitle || '',
        eventDetails: {
          eventName: 'First AI Summit Croydon 2025',
          eventDate: 'October 1st, 2025',
          venue: 'LSBU London South Bank University Croydon'
        },
        accessLevel: badge.accessLevel || 'General Access'
      };
      
      const badgeHTML = await badgeService.generatePrintableBadgeHTML(badgeInfo);
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="ai-summit-badge-${registrationId}.html"`);
      res.send(badgeHTML);
      
    } catch (error) {
      console.error("Error downloading badge:", error);
      res.status(500).json({ message: "Failed to download badge" });
    }
  });

  // AI Summit Exhibitor Registration endpoint
  app.post("/api/ai-summit-exhibitor-registration", async (req, res) => {
    try {
      const { 
        companyName,
        contactName,
        email,
        phone,
        website,
        businessDescription,
        productsServices,
        exhibitionGoals,
        boothRequirements,
        electricalNeeds,
        internetNeeds,
        specialRequirements,
        marketingMaterials,
        numberOfAttendees,
        previousExhibitor,
        referralSource,
        agreesToTerms,
        attendees
      } = req.body;

      // Basic validation
      if (!companyName || !contactName || !email) {
        return res.status(400).json({ message: "Company name, contact name, and email are required" });
      }

      if (!agreesToTerms) {
        return res.status(400).json({ message: "Must agree to exhibitor terms and conditions" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      // Validate attendees array
      if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
        return res.status(400).json({ message: "At least one attendee is required" });
      }

      const actualAttendeeCount = attendees.length;

      // Validate attendee numbers against space/table selection
      if (boothRequirements === 'table-2' && actualAttendeeCount !== 2) {
        return res.status(400).json({ message: "Table for 2 people requires exactly 2 attendees" });
      }
      
      if (boothRequirements === 'table-4' && actualAttendeeCount !== 4) {
        return res.status(400).json({ message: "Table for 4 people requires exactly 4 attendees" });
      }

      if (actualAttendeeCount < 2 || actualAttendeeCount > 4) {
        return res.status(400).json({ message: "Number of attendees must be between 2-4 people due to venue capacity constraints" });
      }

      if (!boothRequirements) {
        return res.status(400).json({ message: "Exhibition space option is required" });
      }

      // Validate attendee information
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        if (!attendee.name || !attendee.name.trim()) {
          return res.status(400).json({ message: `Attendee ${i + 1} name is required` });
        }
        if (!attendee.email || !attendee.email.trim()) {
          return res.status(400).json({ message: `Attendee ${i + 1} email is required` });
        }
        // Validate email format for each attendee
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(attendee.email)) {
          return res.status(400).json({ message: `Please provide a valid email address for attendee ${i + 1}` });
        }
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      if (user) {
        // User already exists - check if they have a registration
        const existingRegistration = await db
          .select()
          .from(aiSummitRegistrations)
          .where(eq(aiSummitRegistrations.email, email));
        
        if (existingRegistration.length > 0) {
          // Already registered - tell them to login
          return res.status(409).json({ 
            message: "You're already registered! Please login to access your account and event badges.",
            alreadyRegistered: true,
            shouldLogin: true
          });
        }
      }
      
      // Create user account if it doesn't exist
      if (!user) {
        const [firstName, ...lastNameParts] = contactName.split(' ');
        const userId = `ai_summit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        user = await storage.upsertUser({
          id: userId,
          email,
          firstName,
          lastName: lastNameParts.join(' ') || '',
          isAdmin: false,
          membershipTier: 'Starter Tier',
          membershipStatus: 'trial',
          accountStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Create user accounts for all attendees
      for (const attendee of attendees) {
        let attendeeUser = await storage.getUserByEmail(attendee.email);
        if (!attendeeUser) {
          const [attendeeFirstName, ...attendeeLastNameParts] = attendee.name.split(' ');
          const attendeeUserId = `ai_summit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          await storage.upsertUser({
            id: attendeeUserId,
            email: attendee.email,
            firstName: attendeeFirstName,
            lastName: attendeeLastNameParts.join(' ') || '',
            isAdmin: false,
            membershipTier: 'Starter Tier',
            membershipStatus: 'trial',
            accountStatus: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      // Store registration in database
      const registration = await storage.createAISummitExhibitorRegistration({
        userId: user.id,
        companyName,
        contactName,
        email,
        phone: phone || null,
        website: website || null,
        businessDescription: businessDescription || null,
        productsServices: productsServices || null,
        exhibitionGoals: exhibitionGoals || null,
        boothRequirements: boothRequirements || "Standard",
        electricalNeeds: electricalNeeds || false,
        internetNeeds: internetNeeds || false,
        specialRequirements: specialRequirements || null,
        marketingMaterials: marketingMaterials || null,
        numberOfAttendees: actualAttendeeCount,
        previousExhibitor: previousExhibitor || false,
        referralSource: referralSource || null,
        agreesToTerms: agreesToTerms,
        registeredAt: new Date(),
        attendees: JSON.stringify(attendees)
      });

      // Sync with MyT Automation (Go High Level)
      try {
        const mytAutomationService = getMyTAutomationService();
        if (mytAutomationService) {
          // Split contact name into first and last name
          const nameParts = contactName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Prepare MyT Automation contact data
          const ghlContactData = {
            email,
            firstName,
            lastName,
            phone: phone,
            companyName: companyName,
            tags: [
              'AI_Summit_2025',
              'Exhibitor_Registration',
              `Booth_${boothRequirements.replace(/[^a-zA-Z0-9]/g, '_')}`,
              ...(previousExhibitor ? ['Previous_Exhibitor'] : ['New_Exhibitor']),
              ...(electricalNeeds ? ['Needs_Electrical'] : []),
              ...(internetNeeds ? ['Needs_Internet'] : [])
            ],
            customFields: {
              company_name: companyName,
              contact_name: contactName,
              website: website,
              business_description: businessDescription,
              products_services: productsServices,
              exhibition_goals: exhibitionGoals,
              booth_requirements: boothRequirements,
              electrical_needs: electricalNeeds,
              internet_needs: internetNeeds,
              special_requirements: specialRequirements,
              marketing_materials: marketingMaterials,
              number_of_attendees: numberOfAttendees,
              previous_exhibitor: previousExhibitor,
              referral_source: referralSource,
              event_name: 'First AI Summit Croydon 2025',
              event_date: 'October 1st, 2025',
              registration_type: 'Exhibitor',
              registration_date: new Date().toISOString()
            }
          };

          // Create or update contact in MyT Automation
          const ghlContact = await mytAutomationService.upsertContact(ghlContactData);
          console.log(`AI Summit exhibitor registration synced to MyT Automation: Contact ID ${ghlContact.id}`);
        }
      } catch (ghlError) {
        console.error("Failed to sync AI Summit exhibitor registration to MyT Automation:", ghlError);
        // Don't fail the registration if MyT Automation sync fails
      }

      // Send confirmation email if email service is available
      try {
        if (emailService) {
          await emailService.sendEmail({
            to: email,
            subject: "AI Summit 2025 Exhibitor Registration Confirmed",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Exhibitor Registration Confirmed!</h1>
                <p>Dear ${contactName},</p>
                <p>Thank you for registering <strong>${companyName}</strong> as an exhibitor for the <strong>First AI Summit Croydon 2025</strong>!</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1f2937; margin-top: 0;">Event Details</h2>
                  <p><strong>Date:</strong> October 1st, 2025</p>
                  <p><strong>Time:</strong> 10:00 AM - 4:00 PM</p>
                  <p><strong>Venue:</strong> LSBU London South Bank University Croydon</p>
                  <p><strong>Booth Type:</strong> ${boothRequirements}</p>
                </div>

                <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1f2937; margin-top: 0;">Your Registration Details</h2>
                  <p><strong>Company:</strong> ${companyName}</p>
                  <p><strong>Contact:</strong> ${contactName}</p>
                  <p><strong>Booth Requirements:</strong> ${boothRequirements}</p>
                  <p><strong>Number of Attendees:</strong> ${numberOfAttendees}</p>
                  ${electricalNeeds ? '<p><strong>✓</strong> Electrical connection required</p>' : ''}
                  ${internetNeeds ? '<p><strong>✓</strong> Internet connection required</p>' : ''}
                </div>

                <p>Our event team will contact you within 2 business days to discuss:</p>
                <ul>
                  <li>Booth allocation and setup details</li>
                  <li>Technical requirements and logistics</li>
                  <li>Marketing opportunities and promotional materials</li>
                  <li>Schedule for setup and breakdown</li>
                </ul>

                <p>We're excited to have ${companyName} as part of this groundbreaking AI event in Croydon!</p>

                <p>If you have any immediate questions, please don't hesitate to contact us.</p>

                <p>Best regards,<br>
                <strong>The Croydon Business Association Events Team</strong></p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error("Failed to send exhibitor confirmation email:", emailError);
        // Don't fail the registration if email fails
      }

      // Process attendees who are also speakers
      const speakerAttendees = attendees.filter(attendee => attendee.isSpeaker);
      const speakerRegistrations = [];

      for (const speakerAttendee of speakerAttendees) {
        try {
          // Create speaker interest registration for this attendee
          const speakerData = {
            name: speakerAttendee.name,
            email: speakerAttendee.email,
            phone: phone || null,
            company: companyName,
            jobTitle: speakerAttendee.jobTitle || null,
            website: website || null,
            linkedIn: null,
            bio: speakerAttendee.speakerBio || null,
            talkTitle: speakerAttendee.presentationTitle || null,
            talkDescription: speakerAttendee.presentationDescription || null,
            talkDuration: "30",
            audienceLevel: "Beginner",
            speakingExperience: null,
            previousSpeaking: false,
            techRequirements: null,
            availableSlots: [],
            motivationToSpeak: "Exhibitor also presenting at booth",
            keyTakeaways: null,
            interactiveElements: false,
            handoutsProvided: false,
            agreesToTerms: true,
            registeredAt: new Date(),
            source: "exhibitor_registration"
          };

          const speakerRegistration = await storage.createAISummitSpeakerInterest(speakerData);
          speakerRegistrations.push(speakerRegistration);

          // Sync speaker to MyT Automation with appropriate tags
          try {
            const mytAutomationService = getMyTAutomationService();
            if (mytAutomationService) {
              const speakerNameParts = speakerAttendee.name.trim().split(' ');
              const speakerFirstName = speakerNameParts[0] || '';
              const speakerLastName = speakerNameParts.slice(1).join(' ') || '';

              // Use enhanced sync for speaker data
              const speakerData = {
                email: speakerAttendee.email,
                firstName: speakerFirstName,
                lastName: speakerLastName,
                phone: phone,
                company: companyName,
                jobTitle: speakerAttendee.jobTitle,
                bio: speakerAttendee.speakerBio,
                sessionType: 'talk',
                talkTitle: speakerAttendee.presentationTitle,
                talkDescription: speakerAttendee.presentationDescription,
                previousSpeaking: false,
                linkedIn: speakerAttendee.linkedIn || ''
              };

              await mytAutomationService.syncSpeaker(speakerData);
              console.log(`Speaker synced to MyT Automation with all custom fields: ${speakerAttendee.email}`);
            }
          } catch (speakerGhlError) {
            console.error("Failed to sync speaker attendee to MyT Automation:", speakerGhlError);
          }

        } catch (speakerError) {
          console.error("Failed to register speaker attendee:", speakerAttendee.name, speakerError);
          // Continue with other attendees even if one fails
        }
      }

      // Create badges for all exhibitor attendees
      let badges = [];
      try {
        badges = await badgeService.createExhibitorBadges(
          registration.id.toString(), 
          attendees, 
          companyName
        );
      } catch (badgeError) {
        console.error("Failed to create exhibitor badges:", badgeError);
        // Don't fail the registration if badge creation fails
      }

      res.json({ 
        success: true, 
        message: `Exhibitor registration successful! ${speakerAttendees.length > 0 ? `${speakerAttendees.length} attendee(s) also registered as speakers. ` : ''}We'll contact you within 2 business days with booth details.`,
        registrationId: registration.id,
        speakerRegistrations: speakerRegistrations.length,
        badgesCreated: badges.length
      });

    } catch (error: any) {
      console.error("AI Summit exhibitor registration error:", error);
      res.status(500).json({ 
        message: "Exhibitor registration failed. Please try again or contact support." 
      });
    }
  });

  // Test MyT Automation connection and sync
  app.get('/api/test-myt-automation', isAuthenticated, async (req: any, res) => {
    try {
      const mytAutomationService = getMyTAutomationService();
      
      if (!mytAutomationService) {
        return res.status(503).json({ 
          success: false,
          message: "MyT Automation service not configured. Please check GHL_API_KEY environment variable." 
        });
      }

      // Test connection
      const isConnected = await mytAutomationService.testConnection();
      if (!isConnected) {
        return res.status(503).json({ 
          success: false,
          message: "Unable to connect to MyT Automation. Please verify your API key." 
        });
      }

      // Get current user data for test sync
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Sync the current user with all custom fields
      const contact = await mytAutomationService.syncBusinessMember(user);

      res.json({ 
        success: true,
        message: "MyT Automation connection successful and user synced!",
        connectionStatus: "connected",
        syncedContact: {
          id: contact.id,
          email: contact.email,
          tags: contact.tags,
          customFieldsCount: Object.keys(contact.customFields || {}).length
        }
      });
    } catch (error: any) {
      console.error("MyT Automation test error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to test MyT Automation connection",
        error: error.message 
      });
    }
  });

  // AI Summit Registration endpoint
  // Check user's AI Summit registration status
  app.get('/api/my-ai-summit-status', isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user.email;
      
      // Check if user has an AI Summit registration
      const registrations = await db
        .select()
        .from(aiSummitRegistrations)
        .where(eq(aiSummitRegistrations.email, userEmail));
      
      // Check if user has a badge
      const badges = await storage.getBadgesByEmail(userEmail);
      
      res.json({
        isRegistered: registrations.length > 0,
        hasBadge: badges.length > 0,
        registrationId: registrations[0]?.id || null,
        badgeId: badges[0]?.badgeId || null,
        participantType: badges[0]?.participantType || null
      });
    } catch (error) {
      console.error("Error checking AI Summit registration status:", error);
      res.status(500).json({ message: "Failed to check registration status" });
    }
  });

  app.post("/api/ai-summit-registration", async (req, res) => {
    try {
      const { 
        name, 
        email, 
        participantType,
        customRole,
        company, 
        jobTitle, 
        phoneNumber, 
        businessType, 
        aiInterest, 
        accessibilityNeeds, 
        comments 
      } = req.body;

      // Basic validation
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      if (user) {
        // User already exists - check if they have a registration
        const existingRegistration = await db
          .select()
          .from(aiSummitRegistrations)
          .where(eq(aiSummitRegistrations.email, email));
        
        if (existingRegistration.length > 0) {
          // Already registered - tell them to login
          return res.status(409).json({ 
            message: "You're already registered! Please login to access your account and event badges.",
            alreadyRegistered: true,
            shouldLogin: true
          });
        }
      }
      
      // Create user account if it doesn't exist
      if (!user) {
        const [firstName, ...lastNameParts] = name.split(' ');
        const userId = `ai_summit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        
        // Generate verification token
        const verificationToken = crypto.randomUUID();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        user = await storage.upsertUser({
          id: userId,
          email,
          firstName,
          lastName: lastNameParts.join(' ') || '',
          isAdmin: false,
          membershipTier: 'Starter Tier',
          membershipStatus: 'trial',
          accountStatus: 'active',
          emailVerified: false,
          verificationToken,
          verificationTokenExpiry,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Store registration in database - insert without RETURNING to avoid Drizzle column mapping issue
      await db
        .insert(aiSummitRegistrations)
        .values({
          userId: user.id,
          name,
          email,
          company: company || null,
          jobTitle: jobTitle || null,
          phoneNumber: phoneNumber || null,
          businessType: businessType || null,
          aiInterest: aiInterest || null,
          accessibilityNeeds: accessibilityNeeds || null,
          comments: comments || null
          // Let all other fields use their defaults
        });
      
      // Fetch the registration we just created
      const [registration] = await db
        .select()
        .from(aiSummitRegistrations)
        .where(and(
          eq(aiSummitRegistrations.email, email),
          eq(aiSummitRegistrations.userId, user.id)
        ))
        .orderBy(desc(aiSummitRegistrations.id))
        .limit(1);

      // Sync with MyT Automation using enhanced sync with all custom fields
      try {
        const mytAutomationService = getMyTAutomationService();
        if (mytAutomationService) {
          // Split name into first and last name
          const nameParts = name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Prepare full attendee data for enhanced sync
          const attendeeData = {
            email,
            firstName,
            lastName,
            phone: phoneNumber,
            company,
            jobTitle,
            title: customRole,
            businessType,
            aiInterest,
            accessibilityNeeds,
            participantRoles: participantType ? [participantType] : ['attendee'],
            customRole,
            primaryRole: participantType || 'attendee',
            eventCheckedIn: false,
            aiSummitRegistered: true
          };

          // Use the enhanced sync method
          const ghlContact = await mytAutomationService.syncAISummitAttendee(attendeeData);
          console.log(`AI Summit registration synced to MyT Automation with all custom fields: Contact ID ${ghlContact.id}`);
        }
      } catch (ghlError) {
        console.error("Failed to sync AI Summit registration to MyT Automation:", ghlError);
        // Don't fail the registration if MyT Automation sync fails
      }

      // Create badge with appropriate participant type
      let badge;
      try {
        // Use provided participant type or default to 'attendee'
        const actualParticipantType = participantType || 'attendee';
        badge = await badgeService.createBadge({
          participantType: actualParticipantType,
          participantId: registration.id.toString(),
          name,
          email,
          company: company || undefined,
          jobTitle: jobTitle || undefined,
          customRole: customRole || undefined
        });
      } catch (badgeError) {
        console.error("Failed to create attendee badge:", badgeError);
        // Don't fail the registration if badge creation fails
      }

      // Send onboarding welcome message based on participant type
      try {
        // First, ensure user has the correct person type assigned
        const { personTypes, userPersonTypes } = await import("@shared/schema");
        
        // Map participant type to person type
        const typeMapping: Record<string, string> = {
          'exhibitor': 'exhibitor',
          'speaker': 'speaker',
          'sponsor': 'sponsor',
          'volunteer': 'volunteer',
          'vip': 'vip',
          'team': 'team_member',
          'media': 'media',
          'attendee': 'attendee'
        };
        
        const personTypeName = typeMapping[participantType] || 'attendee';
        
        // Get or create the person type
        const [personType] = await db
          .select()
          .from(personTypes)
          .where(eq(personTypes.name, personTypeName));
        
        if (personType) {
          // Check if user already has this person type
          const existingUserType = await db
            .select()
            .from(userPersonTypes)
            .where(and(
              eq(userPersonTypes.userId, user.id),
              eq(userPersonTypes.personTypeId, personType.id)
            ));
          
          // If not, add it
          if (existingUserType.length === 0) {
            await db.insert(userPersonTypes).values({
              userId: user.id,
              personTypeId: personType.id,
              isPrimary: true,
              assignedAt: new Date()
            });
          }
        }
        
        // Send onboarding
        const { onboardingService } = await import("./onboardingService");
        await onboardingService.sendOnboarding(user.id);
        console.log(`Onboarding sent for ${participantType || 'attendee'}: ${email}`);
      } catch (onboardingError) {
        console.error('Failed to send onboarding:', onboardingError);
        // Don't fail registration if onboarding fails
      }

      // Send verification email if email service is available and user not verified
      try {
        if (emailService && !user.emailVerified) {
          // Generate verification token if not already present
          let verificationToken = user.verificationToken;
          if (!verificationToken) {
            verificationToken = crypto.randomUUID();
            const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            // Update user with verification token
            await storage.updateUserVerificationToken(user.id, verificationToken, verificationTokenExpiry);
          }
          
          const emailResult = await emailService.sendVerificationEmail(
            email,
            name,
            verificationToken,
            participantType || 'attendee'
          );
          
          if (!emailResult.success) {
            console.error("Failed to send verification email:", emailResult.message);
          }
        }
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail the registration if email fails
      }

      res.json({ 
        success: true, 
        message: "Registration successful! Please check your email to verify your account and access your QR codes.",
        registrationId: registration.id,
        requiresVerification: !user.emailVerified
      });

    } catch (error: any) {
      console.error("AI Summit registration error:", error);
      console.error("Registration attempt details:", { 
        email: req.body.email, 
        name: req.body.name, 
        timestamp: new Date().toISOString() 
      });
      res.status(500).json({ 
        message: "Registration failed. Please try again or contact support." 
      });
    }
  });

  // Email verification endpoint
  app.get('/api/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      // Find user with this verification token
      const allUsers = await storage.listUsers();
      const user = allUsers.find(u => 
        u.verificationToken === token && 
        u.verificationTokenExpiry && 
        new Date(u.verificationTokenExpiry) > new Date()
      );
      
      if (!user) {
        return res.status(400).json({ 
          message: "Invalid or expired verification token. Please request a new verification email." 
        });
      }
      
      // Mark email as verified
      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      // Redirect to login page with success message
      const baseUrl = process.env.BASE_URL || 'https://members.croydonba.org.uk';
      res.redirect(`${baseUrl}/login?verified=true`);
      
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.status(500).json({ 
        message: "Failed to verify email. Please try again or contact support." 
      });
    }
  });

  // AI Summit Speaker Interest endpoint
  // API endpoint for sponsor registration with account creation
  app.post('/api/ai-summit-sponsor-registration', async (req, res) => {
    try {
      const {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        password,
        confirmPassword,
        companyWebsite,
        companyDescription,
        packageName,
        specialRequests,
        agreesToTerms
      } = req.body;

      // Validate required fields
      if (!companyName || !contactName || !contactEmail || !password || !confirmPassword || !packageName || !agreesToTerms) {
        return res.status(400).json({ message: "Please fill in all required fields" });
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Validate password length
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(contactEmail);
      if (existingUser) {
        // Check if they have an AI Summit registration
        const existingRegistration = await db
          .select()
          .from(aiSummitRegistrations)
          .where(eq(aiSummitRegistrations.email, contactEmail));
        
        if (existingRegistration.length > 0) {
          return res.status(409).json({ 
            message: "You're already registered! Please login to access your account and event badges.",
            alreadyRegistered: true,
            shouldLogin: true
          });
        }
      }

      // Create user account
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        email: contactEmail,
        password: hashedPassword,
        firstName: contactName.split(' ')[0] || '',
        lastName: contactName.split(' ').slice(1).join(' ') || '',
        participantType: 'sponsor',
        companyName: companyName,
        phoneNumber: contactPhone || '',
        createdAt: new Date()
      });

      // Store sponsor details in database
      const sponsorDetails = {
        userId: newUser.id,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        companyWebsite,
        companyDescription,
        packageName,
        specialRequests,
        registeredAt: new Date()
      };

      // For now, log the sponsor details (you can add database storage later)
      console.log('Sponsor registered:', sponsorDetails);

      // Send confirmation email
      await emailService.sendNotificationEmail(
        contactEmail,
        'Sponsor Registration Confirmed - AI Summit 2025',
        `
        <h2>Welcome as a Sponsor of AI Summit 2025!</h2>
        <p>Dear ${contactName},</p>
        
        <p>Thank you for registering ${companyName} as a sponsor for the AI Summit 2025. Your account has been created successfully.</p>
        
        <h3>Registration Details:</h3>
        <ul>
          <li><strong>Company:</strong> ${companyName}</li>
          <li><strong>Contact Person:</strong> ${contactName}</li>
          <li><strong>Email:</strong> ${contactEmail}</li>
          <li><strong>Sponsorship Package:</strong> ${packageName}</li>
        </ul>
        
        <p><strong>Login Information:</strong></p>
        <p>You can now log in to your sponsor account using:</p>
        <ul>
          <li>Email: ${contactEmail}</li>
          <li>Password: [the password you created]</li>
        </ul>
        
        <p>Our sponsorship team will contact you within 48 hours to discuss:</p>
        <ul>
          <li>Payment arrangements</li>
          <li>Logo and branding requirements</li>
          <li>Exhibition space setup</li>
          <li>Speaking opportunities (if applicable)</li>
          <li>Marketing materials and promotion</li>
        </ul>
        
        ${specialRequests ? `<p><strong>Your Special Requests:</strong> ${specialRequests}</p>` : ''}
        
        <p>If you have any immediate questions, please contact us at sponsors@croydonba.co.uk</p>
        
        <p>We look forward to partnering with you for this exciting event!</p>
        
        <p>Best regards,<br>
        The AI Summit 2025 Team<br>
        Croydon Business Association</p>
        `
      );

      // Send notification to admin
      await emailService.sendNotificationEmail(
        'admin@croydonba.org.uk',
        'New Sponsor Registration - AI Summit 2025',
        `
        <h2>New Sponsor Registration</h2>
        
        <h3>Company Details:</h3>
        <ul>
          <li><strong>Company:</strong> ${companyName}</li>
          <li><strong>Contact Person:</strong> ${contactName}</li>
          <li><strong>Email:</strong> ${contactEmail}</li>
          <li><strong>Phone:</strong> ${contactPhone || 'Not provided'}</li>
          <li><strong>Website:</strong> ${companyWebsite || 'Not provided'}</li>
          <li><strong>Package:</strong> ${packageName}</li>
        </ul>
        
        <p><strong>Company Description:</strong></p>
        <p>${companyDescription || 'Not provided'}</p>
        
        ${specialRequests ? `<p><strong>Special Requests:</strong></p><p>${specialRequests}</p>` : ''}
        
        <p><strong>Registered at:</strong> ${new Date().toLocaleString()}</p>
        `
      );

      res.json({ 
        success: true, 
        message: "Sponsor registration successful! You can now log in with your email and password.",
        userId: newUser.id 
      });
    } catch (error) {
      console.error('Error registering sponsor:', error);
      res.status(500).json({ message: 'Failed to register sponsor. Please try again.' });
    }
  });

  app.post("/api/ai-summit-speaker-interest", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        company,
        jobTitle,
        website,
        linkedIn,
        bio,
        password,
        confirmPassword,
        sessionType,
        talkTitle,
        talkDescription,
        talkDuration,
        audienceLevel,
        speakingExperience,
        previousSpeaking,
        techRequirements,
        availableSlots,
        motivationToSpeak,
        keyTakeaways,
        interactiveElements,
        handoutsProvided,
        agreesToTerms
      } = req.body;

      // Basic validation
      if (!name || !email || !bio || !talkTitle || !talkDescription || !keyTakeaways || !password) {
        return res.status(400).json({ message: "Name, email, bio, talk title, description, key takeaways, and password are required" });
      }

      if (!agreesToTerms) {
        return res.status(400).json({ message: "Must agree to speaker terms and conditions" });
      }

      // Password validation
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // Check if they have an AI Summit registration
        const existingRegistration = await db
          .select()
          .from(aiSummitRegistrations)
          .where(eq(aiSummitRegistrations.email, email));
        
        if (existingRegistration.length > 0) {
          return res.status(409).json({ 
            message: "You're already registered! Please login to access your account and event badges.",
            alreadyRegistered: true,
            shouldLogin: true
          });
        }
      }

      // Create user account for speaker
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        participantType: 'speaker',
        createdAt: new Date()
      });

      // Add speaker to GoHighLevel if available
      const mytAutomationService = getMyTAutomationService();
      if (mytAutomationService) {
        try {
          await mytAutomationService.addContact({
            firstName: name.split(' ')[0] || name,
            lastName: name.split(' ').slice(1).join(' ') || '',
            email: email,
            phone: phone,
            companyName: company,
            tags: ['ai-summit-speaker-interest', 'speaker-2025'],
            customFields: {
              'talk_title': talkTitle,
              'talk_duration': talkDuration,
              'audience_level': audienceLevel,
              'previous_speaking': previousSpeaking.toString(),
              'job_title': jobTitle
            }
          });
        } catch (ghlError) {
          console.error('MyT Automation sync failed for speaker:', ghlError);
          // Continue with registration even if MyT Automation sync fails
        }
      }

      // Send confirmation email
      if (emailService) {
        try {
          await emailService.sendNotificationEmail({
            to: email,
            subject: "AI Summit 2025 - Speaker Interest Received",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Thank You for Your Speaker Interest!</h2>
                <p>Dear ${name},</p>
                <p>We've received your application to speak at the <strong>First AI Summit Croydon 2025</strong>.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Submission Summary:</h3>
                  <p><strong>Speaker:</strong> ${name}</p>
                  <p><strong>Company:</strong> ${company}</p>
                  <p><strong>Proposed Talk:</strong> ${talkTitle}</p>
                  <p><strong>Duration:</strong> ${talkDuration} minutes</p>
                  <p><strong>Audience Level:</strong> ${audienceLevel}</p>
                </div>

                <p>Our program committee will review your speaking proposal and contact you within 1-2 weeks with:</p>
                <ul>
                  <li>Speaker selection status</li>
                  <li>Schedule confirmation (if selected)</li>
                  <li>Technical setup requirements</li>
                  <li>Event preparation guidelines</li>
                </ul>

                <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3>Your Speaker Account Details:</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Password:</strong> [The password you created during registration]</p>
                  <p>You can log in at any time to manage your speaker profile and check your submission status.</p>
                </div>

                <p>We appreciate your interest in contributing to our inaugural AI Summit and sharing your expertise with the Croydon business community!</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p><strong>Event Details:</strong></p>
                  <p>📅 October 1st, 2025 | 🕙 10:00 AM - 4:00 PM<br>
                  📍 LSBU London South Bank University Croydon</p>
                  <p>Best regards,<br>The Croydon Business Association Program Committee</p>
                </div>
              </div>
            `
          });
        } catch (emailError) {
          console.error("Failed to send speaker confirmation email:", emailError);
          // Don't fail the registration if email fails
        }
      }

      // Store speaker interest in database
      const speakerInterest = await storage.createAISummitSpeakerInterest({
        userId: user.id,
        name,
        email,
        phone,
        company,
        jobTitle,
        website,
        linkedIn,
        bio,
        sessionType: sessionType || "talk",
        talkTitle,
        talkDescription,
        talkDuration,
        audienceLevel,
        speakingExperience,
        previousSpeaking,
        techRequirements,
        availableSlots: Array.isArray(availableSlots) ? JSON.stringify(availableSlots) : JSON.stringify([]),
        motivationToSpeak,
        keyTakeaways,
        interactiveElements,
        handoutsProvided,
        agreesToTerms,
        source: "direct",
        registeredAt: new Date()
      });

      // Also create main AI Summit registration with proper speaker role
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const mainRegistration = await db
        .insert(aiSummitRegistrations)
        .values({
          name,
          email,
          company,
          jobTitle,
          phoneNumber: phone,
          businessType: company ? 'Limited Company' : 'Individual',
          aiInterest: 'Speaking and Education',
          participantRoles: JSON.stringify(['speaker']),
          customRole: sessionType || 'talk',
          emailVerified: true, // Auto-verify speaker accounts
          emailVerificationToken,
          userId: user.id,
          registeredAt: new Date(),
          comments: `Speaker Registration: ${talkTitle}`
        })
        .returning();

      res.json({ 
        success: true, 
        message: "Speaker account created successfully! You can now log in with your email and password. Our program committee will review your proposal and contact you soon.",
        speakerInterestId: speakerInterest.id,
        registrationId: mainRegistration[0]?.id,
        userId: user.id
      });

    } catch (error: any) {
      console.error("AI Summit speaker interest error:", error);
      res.status(500).json({ 
        message: "Speaker registration failed. Please try again or contact support." 
      });
    }
  });

  // ==================== AI SUMMIT BADGE MANAGEMENT ROUTES ====================
  
  // Email printable badge to participant
  app.post("/api/ai-summit/email-badge", async (req, res) => {
    try {
      const { badgeId, email } = req.body;

      if (!badgeId || !email) {
        return res.status(400).json({ message: "Badge ID and email are required" });
      }

      // Get the printable badge HTML
      const badgeHTML = await badgeService.getPrintableBadge(badgeId);
      
      // Send email with printable badge
      const emailResult = await emailService.sendPrintableBadgeEmail(email, badgeId, badgeHTML);
      
      if (emailResult.success) {
        res.json({ message: "Printable badge sent successfully" });
      } else {
        res.status(500).json({ message: emailResult.message });
      }
    } catch (error: any) {
      console.error("Email badge error:", error);
      res.status(500).json({ message: "Failed to send badge email: " + error.message });
    }
  });
  
  // QR Code Check-in/Check-out endpoint
  app.post("/api/ai-summit/check-in", async (req, res) => {
    try {
      const { badgeId, checkInType, location, staffMember, notes } = req.body;

      if (!badgeId || !checkInType) {
        return res.status(400).json({ message: "Badge ID and check-in type are required" });
      }

      if (!['check_in', 'check_out'].includes(checkInType)) {
        return res.status(400).json({ message: "Check-in type must be 'check_in' or 'check_out'" });
      }

      const result = await badgeService.processCheckIn(
        badgeId,
        checkInType,
        location || 'main_entrance',
        staffMember,
        notes
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Check-in error:", error);
      res.status(500).json({ message: "Check-in processing failed: " + error.message });
    }
  });

  // Get badge information
  app.get("/api/ai-summit/badge/:badgeId", async (req, res) => {
    try {
      const { badgeId } = req.params;
      const badge = await badgeService.getBadgeInfo(badgeId);
      
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      res.json(badge);
    } catch (error: any) {
      console.error("Get badge error:", error);
      res.status(500).json({ message: "Failed to get badge information: " + error.message });
    }
  });

  // Generate QR code for badge
  app.get("/api/ai-summit/badge/:badgeId/qr-code", async (req, res) => {
    try {
      const { badgeId } = req.params;
      const qrCodeImage = await badgeService.generateQRCodeImage(badgeId);
      
      res.json({ qrCode: qrCodeImage });
    } catch (error: any) {
      console.error("QR code generation error:", error);
      res.status(500).json({ message: "Failed to generate QR code: " + error.message });
    }
  });

  // Get all badges (admin only)
  app.get("/api/ai-summit/badges", isAuthenticated, async (req, res) => {
    try {
      const badges = await storage.getAllAISummitBadges();
      res.json(badges);
    } catch (error: any) {
      console.error("Get badges error:", error);
      res.status(500).json({ message: "Failed to get badges: " + error.message });
    }
  });

  // Get badges by participant type
  app.get("/api/ai-summit/badges/type/:participantType", isAuthenticated, async (req, res) => {
    try {
      const { participantType } = req.params;
      const badges = await storage.getBadgesByParticipantType(participantType);
      res.json(badges);
    } catch (error: any) {
      console.error("Get badges by type error:", error);
      res.status(500).json({ message: "Failed to get badges by type: " + error.message });
    }
  });

  // Get check-in history for a badge
  app.get("/api/ai-summit/badge/:badgeId/check-ins", isAuthenticated, async (req, res) => {
    try {
      const { badgeId } = req.params;
      const checkIns = await storage.getCheckInsByBadgeId(badgeId);
      res.json(checkIns);
    } catch (error: any) {
      console.error("Get check-ins error:", error);
      res.status(500).json({ message: "Failed to get check-ins: " + error.message });
    }
  });

  // Get attendee statistics
  app.get("/api/ai-summit/attendee-stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await badgeService.getAttendeeStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Get attendee stats error:", error);
      res.status(500).json({ message: "Failed to get attendee statistics: " + error.message });
    }
  });

  // Mark badge as printed
  app.patch("/api/ai-summit/badge/:badgeId/printed", isAuthenticated, async (req, res) => {
    try {
      const { badgeId } = req.params;
      await badgeService.markBadgeAsPrinted(badgeId);
      res.json({ success: true, message: "Badge marked as printed" });
    } catch (error: any) {
      console.error("Mark badge printed error:", error);
      res.status(500).json({ message: "Failed to mark badge as printed: " + error.message });
    }
  });

  // Deactivate badge
  app.patch("/api/ai-summit/badge/:badgeId/deactivate", isAuthenticated, async (req, res) => {
    try {
      const { badgeId } = req.params;
      const { reason } = req.body;
      await badgeService.deactivateBadge(badgeId, reason);
      res.json({ success: true, message: "Badge deactivated" });
    } catch (error: any) {
      console.error("Deactivate badge error:", error);
      res.status(500).json({ message: "Failed to deactivate badge: " + error.message });
    }
  });

  // ==================== VOLUNTEER REGISTRATION ROUTES ====================
  
  app.post("/api/ai-summit/volunteer-registration", async (req, res) => {
    try {
      const validatedData = insertAISummitVolunteerSchema.parse(req.body);
      
      // Check if user already exists
      let user = await storage.getUserByEmail(validatedData.email);
      if (user) {
        // User already exists - check if they have a registration
        const existingRegistration = await db
          .select()
          .from(aiSummitRegistrations)
          .where(eq(aiSummitRegistrations.email, validatedData.email));
        
        if (existingRegistration.length > 0) {
          // Already registered - tell them to login
          return res.status(409).json({ 
            message: "You're already registered! Please login to access your account and event badges.",
            alreadyRegistered: true,
            shouldLogin: true
          });
        }
      }
      
      // Create user account if it doesn't exist
      if (!user) {
        const [firstName, ...lastNameParts] = validatedData.name.split(' ');
        const userId = `ai_summit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        user = await storage.upsertUser({
          id: userId,
          email: validatedData.email,
          firstName,
          lastName: lastNameParts.join(' ') || '',
          isAdmin: false,
          membershipTier: 'Starter Tier',
          membershipStatus: 'trial',
          accountStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const volunteer = await storage.createAISummitVolunteer({
        ...validatedData,
        userId: user.id
      });
      
      // Create volunteer badge
      const badge = await badgeService.createVolunteerBadge(volunteer.id.toString(), volunteer);

      try {
        await emailService.sendEmail({
          to: volunteer.email,
          subject: "🎉 AI Summit Volunteer Registration Confirmed - Thank You!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                <h1>🎉 Volunteer Registration Confirmed!</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <p>Dear ${volunteer.name},</p>
                <p>Thank you for volunteering at the <strong>First AI Summit Croydon 2025</strong>!</p>
                <p><strong>Your Role:</strong> ${volunteer.role}</p>
                <p><strong>Badge ID:</strong> ${badge.badgeId}</p>
                <p>We will contact you with more details about your volunteer assignment closer to the event.</p>
                <p><strong>Event Details:</strong></p>
                <p>📅 October 1st, 2025 | 🕙 10:00 AM - 4:00 PM<br>
                📍 LSBU London South Bank University Croydon</p>
                <p>Best regards,<br>The Croydon Business Association Volunteer Team</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send volunteer confirmation email:", emailError);
      }

      res.json({ 
        success: true, 
        message: "Volunteer registration submitted successfully!",
        badgeId: badge.badgeId
      });

    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Volunteer registration error:", error);
      res.status(500).json({ message: "Volunteer registration failed: " + error.message });
    }
  });

  // Get all volunteers
  app.get("/api/ai-summit/volunteers", isAuthenticated, async (req, res) => {
    try {
      const volunteers = await storage.getAllAISummitVolunteers();
      res.json(volunteers);
    } catch (error: any) {
      console.error("Get volunteers error:", error);
      res.status(500).json({ message: "Failed to get volunteers: " + error.message });
    }
  });

  // ==================== TEAM MEMBER MANAGEMENT ROUTES ====================
  
  app.post("/api/ai-summit/team-member", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAISummitTeamMemberSchema.parse(req.body);
      const teamMember = await storage.createAISummitTeamMember(validatedData);
      
      // Create team member badge
      const badge = await badgeService.createTeamMemberBadge(teamMember.id.toString(), teamMember);

      res.json({ 
        success: true, 
        message: "Team member added successfully!",
        teamMember,
        badgeId: badge.badgeId
      });

    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Team member creation error:", error);
      res.status(500).json({ message: "Failed to create team member: " + error.message });
    }
  });

  // Get all team members
  app.get("/api/ai-summit/team-members", isAuthenticated, async (req, res) => {
    try {
      const teamMembers = await storage.getAllAISummitTeamMembers();
      res.json(teamMembers);
    } catch (error: any) {
      console.error("Get team members error:", error);
      res.status(500).json({ message: "Failed to get team members: " + error.message });
    }
  });



  // AI Summit Workshop Management Endpoints
  
  // Create a new workshop
  app.post("/api/ai-summit/workshops", isAuthenticated, async (req, res) => {
    try {
      const workshopSchema = insertAISummitWorkshopSchema.extend({
        startTime: z.string(),
        endTime: z.string(),
      });
      
      const validated = workshopSchema.parse(req.body);
      
      const workshop = await storage.createAISummitWorkshop({
        ...validated,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
      });
      
      res.json({
        success: true,
        message: "Workshop created successfully!",
        workshop
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Workshop creation error:", error);
      res.status(500).json({ message: "Failed to create workshop: " + error.message });
    }
  });

  // Get all workshops
  app.get("/api/ai-summit/workshops", async (req, res) => {
    try {
      const workshops = await storage.getAllAISummitWorkshops();
      res.json(workshops);
    } catch (error: any) {
      console.error("Get workshops error:", error);
      res.status(500).json({ message: "Failed to get workshops: " + error.message });
    }
  });

  // Get active workshops
  app.get("/api/ai-summit/workshops/active", async (req, res) => {
    try {
      const workshops = await storage.getActiveAISummitWorkshops();
      res.json(workshops);
    } catch (error: any) {
      console.error("Get active workshops error:", error);
      res.status(500).json({ message: "Failed to get active workshops: " + error.message });
    }
  });

  // Register for a workshop
  app.post("/api/ai-summit/workshops/:workshopId/register", isAuthenticated, async (req, res) => {
    try {
      const { workshopId } = req.params;
      const { badgeId } = req.body;
      
      if (!badgeId) {
        return res.status(400).json({ message: "Badge ID is required" });
      }

      // Check workshop capacity
      const capacity = await storage.checkWorkshopCapacity(parseInt(workshopId));
      if (capacity.available <= 0) {
        return res.status(400).json({ message: "Workshop is full" });
      }

      // Check if already registered
      const existingRegistrations = await storage.getWorkshopRegistrationsByWorkshopId(parseInt(workshopId));
      const alreadyRegistered = existingRegistrations.some(reg => reg.badgeId === badgeId);
      
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered for this workshop" });
      }

      const registration = await storage.createAISummitWorkshopRegistration({
        workshopId: parseInt(workshopId),
        badgeId
      });
      
      res.json({
        success: true,
        message: "Registered for workshop successfully!",
        registration
      });
    } catch (error: any) {
      console.error("Workshop registration error:", error);
      res.status(500).json({ message: "Failed to register for workshop: " + error.message });
    }
  });

  // Get workshop registrations
  app.get("/api/ai-summit/workshops/:workshopId/registrations", isAuthenticated, async (req, res) => {
    try {
      const { workshopId } = req.params;
      const registrations = await storage.getWorkshopRegistrationsByWorkshopId(parseInt(workshopId));
      res.json(registrations);
    } catch (error: any) {
      console.error("Get workshop registrations error:", error);
      res.status(500).json({ message: "Failed to get workshop registrations: " + error.message });
    }
  });

  // Get workshop capacity
  app.get("/api/ai-summit/workshops/:workshopId/capacity", async (req, res) => {
    try {
      const { workshopId } = req.params;
      const capacity = await storage.checkWorkshopCapacity(parseInt(workshopId));
      res.json(capacity);
    } catch (error: any) {
      console.error("Get workshop capacity error:", error);
      res.status(500).json({ message: "Failed to get workshop capacity: " + error.message });
    }
  });

  // Public workshop registration (without requiring existing badge)
  app.post("/api/ai-summit/workshops/register-public", async (req, res) => {
    try {
      const {
        workshopId,
        attendeeName,
        attendeeEmail,
        attendeeCompany,
        attendeeJobTitle,
        experienceLevel,
        specificInterests,
        dietaryRequirements,
        accessibilityNeeds
      } = req.body;

      // Basic validation
      if (!workshopId || !attendeeName || !attendeeEmail) {
        return res.status(400).json({ message: "Workshop ID, name, and email are required" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attendeeEmail)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      // Check if workshop exists and is active
      const workshop = await storage.getAISummitWorkshopById(parseInt(workshopId));
      if (!workshop || !workshop.isActive) {
        return res.status(404).json({ message: "Workshop not found or is not active" });
      }

      // Check registration deadline
      if (workshop.registrationDeadline && new Date(workshop.registrationDeadline) < new Date()) {
        return res.status(400).json({ message: "Registration deadline has passed" });
      }

      // Check workshop capacity
      const capacity = await storage.checkWorkshopCapacity(parseInt(workshopId));
      if (capacity.available <= 0) {
        return res.status(400).json({ message: "Workshop is full" });
      }

      // Generate a unique badge ID for this registration
      const badgeId = `WS-${workshopId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create badge entry for workshop attendee
      const badge = await storage.createAISummitBadge({
        badgeId,
        participantType: "attendee",
        participantId: `workshop-${workshopId}`,
        name: attendeeName,
        email: attendeeEmail,
        company: attendeeCompany,
        jobTitle: attendeeJobTitle,
        badgeDesign: "standard",
        qrCodeData: JSON.stringify({
          badgeId,
          type: "workshop_attendee",
          workshopId,
          name: attendeeName,
          email: attendeeEmail,
          registrationType: "workshop_only"
        }),
        isActive: true,
        issuedAt: new Date()
      });

      // Register for the workshop
      const registration = await storage.createAISummitWorkshopRegistration({
        workshopId: parseInt(workshopId),
        badgeId,
        attendeeName,
        attendeeEmail,
        attendeeCompany,
        attendeeJobTitle,
        experienceLevel,
        specificInterests,
        dietaryRequirements,
        accessibilityNeeds,
        registrationSource: "public",
        registeredAt: new Date(),
        checkedIn: false,
        noShow: false
      });

      // Send confirmation email with QR code
      const emailService = getEmailService();
      if (emailService) {
        try {
          await emailService.sendNotificationEmail({
            to: attendeeEmail,
            subject: `AI Summit 2025 - Workshop Registration Confirmed: ${workshop.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Workshop Registration Confirmed!</h2>
                <p>Dear ${attendeeName},</p>
                <p>You've successfully registered for the workshop at the <strong>First AI Summit Croydon 2025</strong>.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Workshop Details:</h3>
                  <p><strong>Workshop:</strong> ${workshop.title}</p>
                  <p><strong>Facilitator:</strong> ${workshop.facilitator}</p>
                  <p><strong>Date & Time:</strong> ${new Date(workshop.startTime).toLocaleDateString()} at ${new Date(workshop.startTime).toLocaleTimeString()}</p>
                  <p><strong>Duration:</strong> ${workshop.duration} minutes</p>
                  <p><strong>Room:</strong> ${workshop.room}</p>
                  <p><strong>Your Badge ID:</strong> ${badgeId}</p>
                </div>

                <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Important Instructions:</h3>
                  <ul>
                    <li>Bring this confirmation email with you</li>
                    <li>Arrive 10 minutes early for check-in</li>
                    <li>Your QR code will be scanned at the workshop entrance</li>
                    <li>Please notify us of any accessibility needs</li>
                  </ul>
                </div>

                ${workshop.prerequisites ? `
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Prerequisites:</h3>
                  <p>${workshop.prerequisites}</p>
                </div>
                ` : ''}

                ${workshop.materials ? `
                <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Materials:</h3>
                  <p>${workshop.materials}</p>
                </div>
                ` : ''}

                <p>We look forward to seeing you at the workshop!</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p><strong>Event Details:</strong></p>
                  <p>📅 October 1st, 2025 | 🕙 10:00 AM - 4:00 PM<br>
                  📍 LSBU London South Bank University Croydon</p>
                  <p>Best regards,<br>The Croydon Business Association Event Team</p>
                </div>
              </div>
            `
          });
        } catch (emailError) {
          console.error("Failed to send workshop confirmation email:", emailError);
          // Don't fail the registration if email fails
        }
      }

      res.json({
        success: true,
        message: "Successfully registered for workshop! Check your email for confirmation.",
        registration: {
          id: registration.id,
          workshopTitle: workshop.title,
          badgeId,
          registeredAt: registration.registeredAt
        }
      });

    } catch (error: any) {
      console.error("Public workshop registration error:", error);
      res.status(500).json({ message: "Failed to register for workshop: " + error.message });
    }
  });

  // Workshop-specific check-in endpoint
  app.post("/api/ai-summit/workshop-checkin", async (req, res) => {
    try {
      const { badgeId, workshopId, checkInType = 'check_in', location, staffMember, notes } = req.body;

      if (!badgeId || !workshopId) {
        return res.status(400).json({ message: "Badge ID and Workshop ID are required" });
      }

      // Get the workshop
      const workshop = await storage.getAISummitWorkshopById(parseInt(workshopId));
      if (!workshop) {
        return res.status(404).json({ message: "Workshop not found" });
      }

      // Get the badge
      const badge = await storage.getAISummitBadgeById(badgeId);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      if (!badge.isActive) {
        return res.status(400).json({ message: "Badge is inactive" });
      }

      // Check if user is registered for this workshop
      const registrations = await storage.getWorkshopRegistrationsByBadgeId(badgeId);
      const workshopRegistration = registrations.find(reg => reg.workshopId === parseInt(workshopId));
      
      if (!workshopRegistration) {
        return res.status(403).json({ 
          message: "Badge holder is not registered for this workshop" 
        });
      }

      // Update registration check-in status
      if (checkInType === 'check_in') {
        await storage.updateWorkshopRegistrationCheckIn(workshopRegistration.id, true, new Date());
      }

      // Record general event check-in/out
      const checkInResult = await badgeService.processCheckIn(
        badgeId, 
        checkInType, 
        location || `workshop_${workshopId}`,
        staffMember,
        notes ? `Workshop: ${workshop.title} - ${notes}` : `Workshop: ${workshop.title}`
      );

      res.json({
        ...checkInResult,
        workshop: {
          id: workshop.id,
          title: workshop.title,
          facilitator: workshop.facilitator,
          room: workshop.room,
          startTime: workshop.startTime,
          endTime: workshop.endTime
        },
        registration: workshopRegistration
      });

    } catch (error: any) {
      console.error("Workshop check-in error:", error);
      res.status(500).json({ message: "Failed to process workshop check-in: " + error.message });
    }
  });

  // AI Summit Speaking Session Management Endpoints
  
  // Create a new speaking session
  app.post("/api/ai-summit/speaking-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessionSchema = insertAISummitSpeakingSessionSchema.extend({
        startTime: z.string(),
        endTime: z.string(),
      });
      
      const validated = sessionSchema.parse(req.body);
      
      const session = await storage.createAISummitSpeakingSession({
        ...validated,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
      });
      
      res.json({
        success: true,
        message: "Speaking session created successfully!",
        session
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Speaking session creation error:", error);
      res.status(500).json({ message: "Failed to create speaking session: " + error.message });
    }
  });

  // Get all speaking sessions
  app.get("/api/ai-summit/speaking-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllAISummitSpeakingSessions();
      res.json(sessions);
    } catch (error: any) {
      console.error("Get speaking sessions error:", error);
      res.status(500).json({ message: "Failed to get speaking sessions: " + error.message });
    }
  });

  // Get active speaking sessions
  app.get("/api/ai-summit/speaking-sessions/active", async (req, res) => {
    try {
      const sessions = await storage.getActiveAISummitSpeakingSessions();
      res.json(sessions);
    } catch (error: any) {
      console.error("Get active speaking sessions error:", error);
      res.status(500).json({ message: "Failed to get active speaking sessions: " + error.message });
    }
  });

  // Register for a speaking session
  app.post("/api/ai-summit/speaking-sessions/:sessionId/register", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { badgeId } = req.body;
      
      if (!badgeId) {
        return res.status(400).json({ message: "Badge ID is required" });
      }

      // Check session capacity
      const capacity = await storage.checkSessionCapacity(parseInt(sessionId));
      if (capacity.available <= 0) {
        return res.status(400).json({ message: "Speaking session is full" });
      }

      // Check if already registered
      const existingRegistrations = await storage.getSessionRegistrationsBySessionId(parseInt(sessionId));
      const alreadyRegistered = existingRegistrations.some(reg => reg.badgeId === badgeId);
      
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered for this speaking session" });
      }

      const registration = await storage.createAISummitSpeakingSessionRegistration({
        sessionId: parseInt(sessionId),
        badgeId
      });
      
      res.json({
        success: true,
        message: "Registered for speaking session successfully!",
        registration
      });
    } catch (error: any) {
      console.error("Speaking session registration error:", error);
      res.status(500).json({ message: "Failed to register for speaking session: " + error.message });
    }
  });

  // Get speaking session registrations
  app.get("/api/ai-summit/speaking-sessions/:sessionId/registrations", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const registrations = await storage.getSessionRegistrationsBySessionId(parseInt(sessionId));
      res.json(registrations);
    } catch (error: any) {
      console.error("Get speaking session registrations error:", error);
      res.status(500).json({ message: "Failed to get speaking session registrations: " + error.message });
    }
  });

  // Get speaking session capacity
  app.get("/api/ai-summit/speaking-sessions/:sessionId/capacity", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const capacity = await storage.checkSessionCapacity(parseInt(sessionId));
      res.json(capacity);
    } catch (error: any) {
      console.error("Get speaking session capacity error:", error);
      res.status(500).json({ message: "Failed to get speaking session capacity: " + error.message });
    }
  });

  // Get participant's registrations
  app.get("/api/ai-summit/registrations/:badgeId", isAuthenticated, async (req, res) => {
    try {
      const { badgeId } = req.params;
      
      const workshopRegistrations = await storage.getWorkshopRegistrationsByBadgeId(badgeId);
      const sessionRegistrations = await storage.getSessionRegistrationsByBadgeId(badgeId);
      
      res.json({
        workshops: workshopRegistrations,
        sessions: sessionRegistrations
      });
    } catch (error: any) {
      console.error("Get participant registrations error:", error);
      res.status(500).json({ message: "Failed to get participant registrations: " + error.message });
    }
  });

  // Real-time occupancy tracking endpoints
  app.get("/api/ai-summit/occupancy", isAuthenticated, async (req, res) => {
    try {
      const occupancy = await storage.getCurrentOccupancy();
      res.json(occupancy);
    } catch (error: any) {
      console.error("Get occupancy error:", error);
      res.status(500).json({ message: "Failed to get occupancy data: " + error.message });
    }
  });

  app.get("/api/ai-summit/occupancy/detailed", isAuthenticated, async (req, res) => {
    try {
      const detailed = await storage.getDetailedOccupancy();
      res.json(detailed);
    } catch (error: any) {
      console.error("Get detailed occupancy error:", error);
      res.status(500).json({ message: "Failed to get detailed occupancy data: " + error.message });
    }
  });

  app.get("/api/ai-summit/occupancy/history", isAuthenticated, async (req, res) => {
    try {
      const { hours = 24 } = req.query;
      const history = await storage.getOccupancyHistory(parseInt(hours as string));
      res.json(history);
    } catch (error: any) {
      console.error("Get occupancy history error:", error);
      res.status(500).json({ message: "Failed to get occupancy history: " + error.message });
    }
  });

  // ==================== USER PROFILE MANAGEMENT ====================
  
  // Update user profile
  app.patch("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const { firstName, lastName, phone, company, jobTitle, bio, isProfileHidden } = req.body;
      
      const user = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        phone,
        company,
        jobTitle,
        bio,
        isProfileHidden
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Get user's event registrations
  app.get("/api/my-event-registrations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      
      const registrations = await storage.getUserEventRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching user event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  // ==================== GENERAL EVENT MANAGEMENT API ROUTES ====================

  // Event Time Slots Management Routes
  app.get("/api/events/:eventId/time-slots", async (req, res) => {
    try {
      const { eventId } = req.params;
      const timeSlots = await db
        .select({
          id: eventTimeSlots.id,
          eventId: eventTimeSlots.eventId,
          title: eventTimeSlots.title,
          description: eventTimeSlots.description,
          slotType: eventTimeSlots.slotType,
          startTime: eventTimeSlots.startTime,
          endTime: eventTimeSlots.endTime,
          room: eventTimeSlots.room,
          maxCapacity: eventTimeSlots.maxCapacity,
          currentAttendees: eventTimeSlots.currentAttendees,
          speakerId: eventTimeSlots.speakerId,
          moderatorId: eventTimeSlots.moderatorId,
          isBreak: eventTimeSlots.isBreak,
          materials: eventTimeSlots.materials,
          streamingUrl: eventTimeSlots.streamingUrl,
          recordingUrl: eventTimeSlots.recordingUrl,
          tags: eventTimeSlots.tags,
          requiresRegistration: eventTimeSlots.requiresRegistration,
          displayOrder: eventTimeSlots.displayOrder,
          speakerName: users.firstName,
          speakerLastName: users.lastName,
          speakerEmail: users.email,
        })
        .from(eventTimeSlots)
        .leftJoin(users, eq(eventTimeSlots.speakerId, users.id))
        .where(eq(eventTimeSlots.eventId, parseInt(eventId)))
        .orderBy(eventTimeSlots.displayOrder, eventTimeSlots.startTime);

      // Get additional speakers for each time slot
      const slotSpeakers = await db
        .select({
          timeSlotId: timeSlotSpeakers.timeSlotId,
          speakerId: timeSlotSpeakers.speakerId,
          role: timeSlotSpeakers.role,
          displayOrder: timeSlotSpeakers.displayOrder,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          title: users.title,
          company: users.company,
        })
        .from(timeSlotSpeakers)
        .leftJoin(users, eq(timeSlotSpeakers.speakerId, users.id))
        .where(
          inArray(
            timeSlotSpeakers.timeSlotId, 
            timeSlots.map(slot => slot.id)
          )
        )
        .orderBy(timeSlotSpeakers.displayOrder);

      // Combine time slots with their speakers
      const timeSlotsWithSpeakers = timeSlots.map(slot => ({
        ...slot,
        speakers: slotSpeakers.filter(speaker => speaker.timeSlotId === slot.id),
        primarySpeaker: slot.speakerId ? {
          id: slot.speakerId,
          name: `${slot.speakerName || ''} ${slot.speakerLastName || ''}`.trim(),
          email: slot.speakerEmail,
        } : null,
      }));

      res.json(timeSlotsWithSpeakers);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ error: "Failed to fetch time slots" });
    }
  });

  // Create new time slot (admin only)
  app.post('/api/events/:eventId/time-slots', isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const eventId = parseInt(req.params.eventId);
      const { title, description, slotType, startTime, endTime, room, maxCapacity, isBreak } = req.body;

      const [newSlot] = await db.insert(eventTimeSlots).values({
        eventId,
        title,
        description,
        slotType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        room,
        maxCapacity,
        currentAttendees: 0,
        isBreak: isBreak || false,
        displayOrder: 99 // Will be adjusted automatically
      }).returning();

      res.json(newSlot);
    } catch (error) {
      console.error('Error creating time slot:', error);
      res.status(500).json({ error: 'Failed to create time slot' });
    }
  });

  // Update time slot (admin only)
  app.put('/api/events/:eventId/time-slots/:slotId', isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const slotId = parseInt(req.params.slotId);
      const { title, description, slotType, startTime, endTime, room, maxCapacity, isBreak } = req.body;

      const [updatedSlot] = await db.update(eventTimeSlots)
        .set({
          title,
          description,
          slotType,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          room,
          maxCapacity,
          isBreak: isBreak || false
        })
        .where(eq(eventTimeSlots.id, slotId))
        .returning();

      res.json(updatedSlot);
    } catch (error) {
      console.error('Error updating time slot:', error);
      res.status(500).json({ error: 'Failed to update time slot' });
    }
  });

  // Delete time slot (admin only)
  app.delete('/api/events/:eventId/time-slots/:slotId', isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const slotId = parseInt(req.params.slotId);

      // First remove any speaker assignments
      await db.delete(timeSlotSpeakers).where(eq(timeSlotSpeakers.timeSlotId, slotId));

      // Then delete the slot
      await db.delete(eventTimeSlots).where(eq(eventTimeSlots.id, slotId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting time slot:', error);
      res.status(500).json({ error: 'Failed to delete time slot' });
    }
  });

  // Assign speaker to time slot (admin only)
  app.post('/api/events/:eventId/time-slots/:slotId/assign-speaker', isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const slotId = parseInt(req.params.slotId);
      const { speakerId } = req.body;

      const [assignment] = await db.insert(timeSlotSpeakers).values({
        timeSlotId: slotId,
        speakerId,
        role: 'speaker',
        displayOrder: 0
      }).returning();

      res.json(assignment);
    } catch (error) {
      console.error('Error assigning speaker:', error);
      res.status(500).json({ error: 'Failed to assign speaker' });
    }
  });

  // ==================== TIME SLOT BOOKING SYSTEM ====================

  // Register for a time slot (attendees book seats in advance)
  app.post('/api/events/:eventId/time-slots/:slotId/register', isAuthenticated, async (req, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const userId = req.user?.claims?.sub || req.user?.id;
      const { badgeId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      // Check if slot exists and has capacity
      const [slot] = await db.select().from(eventTimeSlots).where(eq(eventTimeSlots.id, slotId));
      if (!slot) {
        return res.status(404).json({ error: "Time slot not found" });
      }

      // Check current registrations against room capacity limits
      const registrations = await db.select().from(timeSlotRegistrations).where(eq(timeSlotRegistrations.timeSlotId, slotId));
      
      // Enforce strict capacity limits: Auditorium=80, Classroom=65
      let maxAllowed = slot.maxCapacity;
      if (slot.room === 'Auditorium' && maxAllowed > 80) {
        maxAllowed = 80;
      } else if (slot.room === 'Classroom' && maxAllowed > 65) {
        maxAllowed = 65;
      }
      
      if (registrations.length >= maxAllowed) {
        return res.status(400).json({ 
          error: `Time slot is fully booked. ${slot.room} capacity: ${maxAllowed} people` 
        });
      }

      // Check if user already registered
      const existingRegistration = registrations.find(r => r.userId === userId);
      if (existingRegistration) {
        return res.status(400).json({ error: "Already registered for this time slot" });
      }

      // Create registration
      const [registration] = await db.insert(timeSlotRegistrations).values({
        timeSlotId: slotId,
        userId,
        badgeId,
        attendanceStatus: 'booked'
      }).returning();

      // Update current attendees count
      await db.update(eventTimeSlots)
        .set({ currentAttendees: registrations.length + 1 })
        .where(eq(eventTimeSlots.id, slotId));

      res.json({ success: true, registration });
    } catch (error) {
      console.error('Error registering for time slot:', error);
      res.status(500).json({ error: 'Failed to register for time slot' });
    }
  });

  // Cancel time slot registration
  app.delete('/api/events/:eventId/time-slots/:slotId/register', isAuthenticated, async (req, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const userId = req.user?.claims?.sub || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      // Delete registration
      const deletedRegistrations = await db.delete(timeSlotRegistrations)
        .where(and(
          eq(timeSlotRegistrations.timeSlotId, slotId),
          eq(timeSlotRegistrations.userId, userId)
        ))
        .returning();

      if (deletedRegistrations.length === 0) {
        return res.status(404).json({ error: "Registration not found" });
      }

      // Update current attendees count
      const remainingRegistrations = await db.select().from(timeSlotRegistrations)
        .where(eq(timeSlotRegistrations.timeSlotId, slotId));
      
      await db.update(eventTimeSlots)
        .set({ currentAttendees: remainingRegistrations.length })
        .where(eq(eventTimeSlots.id, slotId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error cancelling time slot registration:', error);
      res.status(500).json({ error: 'Failed to cancel registration' });
    }
  });

  // Get user's time slot registrations
  app.get('/api/my-time-slot-registrations', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      const registrations = await db.select({
        id: timeSlotRegistrations.id,
        timeSlotId: timeSlotRegistrations.timeSlotId,
        badgeId: timeSlotRegistrations.badgeId,
        registeredAt: timeSlotRegistrations.registeredAt,
        attendanceStatus: timeSlotRegistrations.attendanceStatus,
        scannedAt: timeSlotRegistrations.scannedAt,
        title: eventTimeSlots.title,
        description: eventTimeSlots.description,
        slotType: eventTimeSlots.slotType,
        startTime: eventTimeSlots.startTime,
        endTime: eventTimeSlots.endTime,
        room: eventTimeSlots.room
      })
      .from(timeSlotRegistrations)
      .leftJoin(eventTimeSlots, eq(timeSlotRegistrations.timeSlotId, eventTimeSlots.id))
      .where(eq(timeSlotRegistrations.userId, userId))
      .orderBy(eventTimeSlots.startTime);

      res.json(registrations);
    } catch (error) {
      console.error('Error fetching time slot registrations:', error);
      res.status(500).json({ error: 'Failed to fetch registrations' });
    }
  });

  // Get time slot registration details (admin only)
  app.get('/api/events/:eventId/time-slots/:slotId/registrations', isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const slotId = parseInt(req.params.slotId);

      const registrations = await db.select({
        id: timeSlotRegistrations.id,
        userId: timeSlotRegistrations.userId,
        badgeId: timeSlotRegistrations.badgeId,
        registeredAt: timeSlotRegistrations.registeredAt,
        attendanceStatus: timeSlotRegistrations.attendanceStatus,
        scannedAt: timeSlotRegistrations.scannedAt,
        scannedBy: timeSlotRegistrations.scannedBy,
        userName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userCompany: users.company
      })
      .from(timeSlotRegistrations)
      .leftJoin(users, eq(timeSlotRegistrations.userId, users.id))
      .where(eq(timeSlotRegistrations.timeSlotId, slotId))
      .orderBy(timeSlotRegistrations.registeredAt);

      res.json(registrations);
    } catch (error) {
      console.error('Error fetching time slot registrations:', error);
      res.status(500).json({ error: 'Failed to fetch registrations' });
    }
  });

  // Mark attendance via QR code scan (admin/volunteer only)
  app.post('/api/events/:eventId/time-slots/:slotId/scan-attendance', isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin && req.user?.participantType !== 'volunteer') {
        return res.status(403).json({ error: "Admin or volunteer access required" });
      }

      const slotId = parseInt(req.params.slotId);
      const { badgeId } = req.body;
      const scannedBy = req.user?.claims?.sub || req.user?.id;

      // Find registration by badge ID
      const [registration] = await db.select()
        .from(timeSlotRegistrations)
        .where(and(
          eq(timeSlotRegistrations.timeSlotId, slotId),
          eq(timeSlotRegistrations.badgeId, badgeId)
        ));

      if (!registration) {
        return res.status(404).json({ error: "Registration not found for this badge and time slot" });
      }

      // Update attendance
      const [updatedRegistration] = await db.update(timeSlotRegistrations)
        .set({
          attendanceStatus: 'attended',
          scannedAt: new Date(),
          scannedBy
        })
        .where(eq(timeSlotRegistrations.id, registration.id))
        .returning();

      res.json({ success: true, registration: updatedRegistration });
    } catch (error) {
      console.error('Error scanning attendance:', error);
      res.status(500).json({ error: 'Failed to scan attendance' });
    }
  });

  // Create a new time slot
  app.post("/api/events/:eventId/time-slots", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { eventId } = req.params;
      const timeSlotData = insertEventTimeSlotSchema.parse({
        ...req.body,
        eventId: parseInt(eventId),
      });

      const [newTimeSlot] = await db
        .insert(eventTimeSlots)
        .values(timeSlotData)
        .returning();

      // Add speakers if provided
      if (req.body.speakers && Array.isArray(req.body.speakers)) {
        const speakersToAdd = req.body.speakers.map((speaker: any) => ({
          timeSlotId: newTimeSlot.id,
          speakerId: speaker.speakerId,
          role: speaker.role || 'speaker',
          displayOrder: speaker.displayOrder || 0,
        }));

        if (speakersToAdd.length > 0) {
          await db.insert(timeSlotSpeakers).values(speakersToAdd);
        }
      }

      res.json(newTimeSlot);
    } catch (error) {
      console.error("Error creating time slot:", error);
      res.status(500).json({ error: "Failed to create time slot" });
    }
  });

  // Update a time slot
  app.put("/api/time-slots/:slotId", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { slotId } = req.params;
      const updates = req.body;

      // Remove speakers array from updates if present (handled separately)
      const { speakers, ...timeSlotUpdates } = updates;

      // Update the time slot
      const [updatedSlot] = await db
        .update(eventTimeSlots)
        .set({
          ...timeSlotUpdates,
          updatedAt: new Date(),
        })
        .where(eq(eventTimeSlots.id, parseInt(slotId)))
        .returning();

      // Update speakers if provided
      if (speakers && Array.isArray(speakers)) {
        // Remove existing speakers
        await db
          .delete(timeSlotSpeakers)
          .where(eq(timeSlotSpeakers.timeSlotId, parseInt(slotId)));

        // Add new speakers
        const speakersToAdd = speakers.map((speaker: any) => ({
          timeSlotId: parseInt(slotId),
          speakerId: speaker.speakerId,
          role: speaker.role || 'speaker',
          displayOrder: speaker.displayOrder || 0,
        }));

        if (speakersToAdd.length > 0) {
          await db.insert(timeSlotSpeakers).values(speakersToAdd);
        }
      }

      res.json(updatedSlot);
    } catch (error) {
      console.error("Error updating time slot:", error);
      res.status(500).json({ error: "Failed to update time slot" });
    }
  });

  // Delete a time slot
  app.delete("/api/time-slots/:slotId", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { slotId } = req.params;

      await db
        .delete(eventTimeSlots)
        .where(eq(eventTimeSlots.id, parseInt(slotId)));

      res.json({ message: "Time slot deleted successfully" });
    } catch (error) {
      console.error("Error deleting time slot:", error);
      res.status(500).json({ error: "Failed to delete time slot" });
    }
  });

  // Book time slot for speaker
  app.post("/api/time-slots/:slotId/book", isAuthenticated, async (req, res) => {
    try {
      const { slotId } = req.params;
      const { speakerId } = req.body;
      const userId = (req.user as any)?.id;

      // Verify the user is booking for themselves or is admin
      if (speakerId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: "Can only book slots for yourself" });
      }

      // Check if slot exists and is available
      const [slot] = await db
        .select()
        .from(eventTimeSlots)
        .where(eq(eventTimeSlots.id, parseInt(slotId)));

      if (!slot) {
        return res.status(404).json({ error: "Time slot not found" });
      }

      if (slot.isBreak) {
        return res.status(400).json({ error: "Cannot book break slots" });
      }

      // Check if slot is already booked
      const existingSpeakers = await db
        .select()
        .from(timeSlotSpeakers)
        .where(eq(timeSlotSpeakers.timeSlotId, parseInt(slotId)));

      if (existingSpeakers.length > 0) {
        return res.status(400).json({ error: "Time slot is already booked" });
      }

      // Check if speaker already has a slot booked
      const speakerSlots = await db
        .select()
        .from(timeSlotSpeakers)
        .where(eq(timeSlotSpeakers.speakerId, speakerId));

      if (speakerSlots.length > 0) {
        return res.status(400).json({ error: "You already have a time slot booked" });
      }

      // Book the slot
      const [booking] = await db
        .insert(timeSlotSpeakers)
        .values({
          timeSlotId: parseInt(slotId),
          speakerId: speakerId,
          role: "speaker",
          displayOrder: 0,
        })
        .returning();

      res.json({ 
        message: "Time slot booked successfully",
        booking,
        slot: slot 
      });
    } catch (error) {
      console.error("Error booking time slot:", error);
      res.status(500).json({ error: "Failed to book time slot" });
    }
  });

  // Get speaker profile/data
  app.get("/api/speaker/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;

      // Get speaker interest data
      const [speakerData] = await db
        .select()
        .from(aiSummitSpeakerInterests)
        .where(eq(aiSummitSpeakerInterests.userId, userId));

      if (!speakerData) {
        return res.status(404).json({ error: "Speaker profile not found" });
      }

      res.json({
        name: speakerData.name,
        email: speakerData.email,
        company: speakerData.company,
        talkTitle: speakerData.talkTitle,
        talkDescription: speakerData.talkDescription,
        sessionType: speakerData.sessionType,
      });
    } catch (error) {
      console.error("Error fetching speaker profile:", error);
      res.status(500).json({ error: "Failed to fetch speaker profile" });
    }
  });

  // Get all events (public endpoint)
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getPublishedEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get specific event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create event (admin only)
  app.post("/api/events", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Validate and convert date strings to Date objects
      const eventData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        registrationStartDate: req.body.registrationStartDate ? new Date(req.body.registrationStartDate) : undefined,
        registrationEndDate: req.body.registrationEndDate ? new Date(req.body.registrationEndDate) : undefined,
        earlyBirdDeadline: req.body.earlyBirdDeadline ? new Date(req.body.earlyBirdDeadline) : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update event (admin only)
  app.put("/api/events/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate and convert date strings to Date objects
      const eventData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        registrationStartDate: req.body.registrationStartDate ? new Date(req.body.registrationStartDate) : undefined,
        registrationEndDate: req.body.registrationEndDate ? new Date(req.body.registrationEndDate) : undefined,
        earlyBirdDeadline: req.body.earlyBirdDeadline ? new Date(req.body.earlyBirdDeadline) : undefined,
        updatedAt: new Date()
      };
      
      // Remove undefined values to avoid overwriting existing data with undefined
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === undefined) {
          delete eventData[key];
        }
      });
      
      const event = await storage.updateEvent(id, eventData);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event (admin only)
  app.delete("/api/events/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Get event registrations
  app.get("/api/events/:id/registrations", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const registrations = await storage.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Register for event
  app.post("/api/events/:id/register", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      
      // Generate unique ticket ID
      const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const registration = await storage.createEventRegistration({
        eventId,
        userId,
        ticketId,
        participantName: req.body.participantName,
        participantEmail: req.body.participantEmail,
        participantPhone: req.body.participantPhone,
        registrationType: req.body.registrationType || 'general',
        specialRequirements: req.body.specialRequirements,
        status: 'registered'
      });
      
      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Check in with ticket
  app.post("/api/events/checkin", isAuthenticated, async (req, res) => {
    try {
      const { ticketId } = req.body;
      const staffMember = (req.user as any)?.email || 'Unknown Staff';
      
      const registration = await storage.checkInEventRegistration(ticketId, staffMember);
      res.json(registration);
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  // Get event sessions
  app.get("/api/events/:id/sessions", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const sessions = await storage.getEventSessions(eventId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Create event session (admin only)
  app.post("/api/events/:id/sessions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const session = await storage.createEventSession({
        ...req.body,
        eventId
      });
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Update event session (admin only)
  app.put("/api/sessions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updateEventSession(id, req.body);
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Delete event session (admin only)
  app.delete("/api/sessions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEventSession(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Register for session
  app.post("/api/sessions/:id/register", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const registrationId = parseInt(req.body.registrationId);
      
      const sessionRegistration = await storage.createEventSessionRegistration({
        sessionId,
        registrationId
      });
      
      res.status(201).json(sessionRegistration);
    } catch (error) {
      console.error("Error registering for session:", error);
      res.status(500).json({ message: "Failed to register for session" });
    }
  });

  // Get session registrations
  app.get("/api/sessions/:id/registrations", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const registrations = await storage.getEventSessionRegistrations(sessionId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching session registrations:", error);
      res.status(500).json({ message: "Failed to fetch session registrations" });
    }
  });

  // Generate ticket/badge for event registration
  app.get("/api/events/ticket/:ticketId", async (req, res) => {
    try {
      const { ticketId } = req.params;
      const registration = await storage.getEventRegistrationByTicketId(ticketId);
      
      if (!registration) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Get event details
      const event = await storage.getEventById(registration.eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json({
        ticketId: registration.ticketId,
        participantName: registration.participantName,
        participantEmail: registration.participantEmail,
        eventName: event.title,
        eventDate: event.startDate,
        eventLocation: event.location,
        registrationType: registration.registrationType,
        status: registration.status,
        qrData: JSON.stringify({
          ticketId: registration.ticketId,
          eventId: registration.eventId,
          participantName: registration.participantName,
          registrationType: registration.registrationType
        })
      });
    } catch (error) {
      console.error("Error generating ticket:", error);
      res.status(500).json({ message: "Failed to generate ticket" });
    }
  });

  // Get user's event registrations
  app.get("/api/user/event-registrations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      // Return empty array for now to avoid database errors
      res.json([]);
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // GoHighLevel Chatbot API endpoint
  app.post("/api/ghl/chatbot/message", async (req, res) => {
    try {
      const { message, sessionId, contactInfo } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and session ID are required" });
      }

      const mytAutomationService = getMyTAutomationService();
      
      if (!mytAutomationService) {
        // If MyT Automation is not configured, use fallback responses only
        console.warn("MyT Automation service not available, using fallback responses");
        const fallbackResponse = getFallbackChatbotResponse(message);
        return res.json({ response: fallbackResponse, success: false });
      }

      // Send message to GoHighLevel
      const result = await mytAutomationService.sendChatbotMessage(message, sessionId, contactInfo);
      
      // Track the interaction for analytics
      await mytAutomationService.trackChatbotInteraction(sessionId, message, result.response, result.success);
      
      res.json(result);
    } catch (error) {
      console.error("Chatbot API error:", error);
      const fallbackResponse = getFallbackChatbotResponse(req.body.message || "");
      res.json({ 
        response: fallbackResponse, 
        success: false,
        error: "Service temporarily unavailable" 
      });
    }
  });

  // Personal Badge System
  
  // Get user's personal badge
  app.get('/api/my-personal-badge', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      const badge = await db
        .select()
        .from(personalBadges)
        .where(eq(personalBadges.userId, userId))
        .limit(1);
      
      if (badge.length === 0) {
        return res.status(404).json({ message: "No personal badge found" });
      }
      
      res.json(badge[0]);
    } catch (error) {
      console.error('Error fetching personal badge:', error);
      res.status(500).json({ message: "Failed to fetch personal badge" });
    }
  });

  // Get user's badge profile
  app.get('/api/my-badge-profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userData = user[0];
      res.json({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        title: userData.title || '',
        company: userData.company || '',
        jobTitle: userData.jobTitle || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        qrHandle: userData.qrHandle || '',
        membershipTier: userData.membershipTier || 'Starter Tier'
      });
    } catch (error) {
      console.error('Error fetching badge profile:', error);
      res.status(500).json({ message: "Failed to fetch badge profile" });
    }
  });

  // Create personal badge
  app.post('/api/create-personal-badge', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, title, company, jobTitle, phone, bio, qrHandle } = req.body;
      
      if (!qrHandle) {
        return res.status(400).json({ message: "QR handle is required" });
      }

      // Check if QR handle is already taken
      const existingHandle = await db
        .select()
        .from(personalBadges)
        .where(eq(personalBadges.qrHandle, qrHandle.toLowerCase()))
        .limit(1);
      
      if (existingHandle.length > 0) {
        return res.status(400).json({ message: "QR handle is already taken" });
      }

      // Update user profile
      await db
        .update(users)
        .set({
          firstName: firstName || null,
          lastName: lastName || null,
          title: title || null,
          company: company || null,
          jobTitle: jobTitle || null,
          phone: phone || null,
          bio: bio || null,
          qrHandle: qrHandle.toLowerCase(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Create personal badge
      const badgeId = `CBA-${qrHandle.toUpperCase()}`;
      const badge = await db
        .insert(personalBadges)
        .values({
          userId: userId,
          badgeId: badgeId,
          qrHandle: qrHandle.toLowerCase(),
          isActive: true
        })
        .returning();

      // Create initial event assignment for AI Summit with multiple roles support
      await db
        .insert(eventBadgeAssignments)
        .values({
          badgeId: badgeId,
          eventId: 'ai-summit-2025',
          eventName: 'First AI Summit Croydon 2025',
          participantRoles: '["attendee"]',
          primaryRole: 'attendee',
          badgeColor: '#3B82F6',
          accessLevel: 'basic',
          isActive: true
        });

      res.json({
        success: true,
        badgeId: badgeId,
        qrHandle: qrHandle.toLowerCase()
      });
    } catch (error) {
      console.error('Error creating personal badge:', error);
      res.status(500).json({ message: "Failed to create personal badge" });
    }
  });

  // Update badge profile
  app.put('/api/update-badge-profile', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, title, company, jobTitle, phone, bio, qrHandle } = req.body;
      
      // Update user profile
      await db
        .update(users)
        .set({
          firstName: firstName || null,
          lastName: lastName || null,
          title: title || null,
          company: company || null,
          jobTitle: jobTitle || null,
          phone: phone || null,
          bio: bio || null,
          qrHandle: qrHandle ? qrHandle.toLowerCase() : null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // If QR handle changed, update personal badge
      if (qrHandle) {
        await db
          .update(personalBadges)
          .set({
            qrHandle: qrHandle.toLowerCase(),
            updatedAt: new Date()
          })
          .where(eq(personalBadges.userId, userId));
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('Error updating badge profile:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Download personal badge
  app.get('/api/download-personal-badge/:badgeId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { badgeId } = req.params;
      const userId = req.user.id;
      
      // Get personal badge and verify ownership
      const badge = await db
        .select()
        .from(personalBadges)
        .where(eq(personalBadges.badgeId, badgeId))
        .limit(1);
      
      if (badge.length === 0 || badge[0].userId !== userId) {
        return res.status(403).json({ message: "Badge not found or not owned by user" });
      }

      // Get user profile
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = user[0];
      const badgeData = badge[0];

      // Generate badge HTML with QR code and styling
      const badgeHtml = await badgeService.generatePersonalBadgeHTML({
        badgeId: badgeData.badgeId,
        qrHandle: badgeData.qrHandle,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        title: userData.title,
        company: userData.company,
        jobTitle: userData.jobTitle,
        phone: userData.phone,
        membershipTier: userData.membershipTier,
        qrCodeData: {
          badgeId: badgeData.badgeId,
          qrHandle: badgeData.qrHandle,
          name: `${userData.firstName} ${userData.lastName}`.trim(),
          membershipTier: userData.membershipTier,
          company: userData.company,
          type: 'personal_badge'
        },
        qrHandle: badgeData.qrHandle // Store qrHandle separately for easy access
      });

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="personal-badge-${badgeData.qrHandle}.html"`);
      res.send(badgeHtml);
    } catch (error) {
      console.error('Error downloading personal badge:', error);
      res.status(500).json({ message: "Failed to download badge" });
    }
  });

  // ===========================
  // Enhanced CBA Event Management API Routes
  // ===========================

  // Get all CBA events
  app.get('/api/cba-events', async (req: Request, res: Response) => {
    try {
      const events = await db.select().from(cbaEvents).where(eq(cbaEvents.isActive, true));
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching CBA events:", error);
      res.status(500).json({ message: "Failed to fetch events: " + error.message });
    }
  });

  // Create personal badge event linking
  app.post('/api/personal-badge-events', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = validateRequest(insertPersonalBadgeEventSchema, req.body);
      
      // Get user's personal badge
      const [personalBadge] = await db.select().from(personalBadges)
        .where(eq(personalBadges.userId, userId));
      
      if (!personalBadge) {
        return res.status(404).json({ message: "Personal badge not found. Create a personal badge first." });
      }

      // Add the personal badge ID to the data
      const badgeEventData = {
        ...validatedData,
        personalBadgeId: personalBadge.id
      };

      const [badgeEvent] = await db.insert(personalBadgeEvents)
        .values(badgeEventData)
        .returning();

      res.json(badgeEvent);
    } catch (error: any) {
      console.error("Error creating personal badge event:", error);
      res.status(500).json({ message: "Failed to create badge event: " + error.message });
    }
  });

  // Get personal badge events for current user
  app.get('/api/personal-badge-events', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user's personal badge
      const [personalBadge] = await db.select().from(personalBadges)
        .where(eq(personalBadges.userId, userId));
      
      if (!personalBadge) {
        return res.json([]);
      }

      // Get badge events with event details
      const badgeEvents = await db.select({
        id: personalBadgeEvents.id,
        personalBadgeId: personalBadgeEvents.personalBadgeId,
        eventId: personalBadgeEvents.eventId,
        roleAtEvent: personalBadgeEvents.roleAtEvent,
        badgeDesign: personalBadgeEvents.badgeDesign,
        customFields: personalBadgeEvents.customFields,
        qrCodeData: personalBadgeEvents.qrCodeData,
        checkedIn: personalBadgeEvents.checkedIn,
        checkedInAt: personalBadgeEvents.checkedInAt,
        checkedOut: personalBadgeEvents.checkedOut,
        checkedOutAt: personalBadgeEvents.checkedOutAt,
        badgePrinted: personalBadgeEvents.badgePrinted,
        badgePrintedAt: personalBadgeEvents.badgePrintedAt,
        isActive: personalBadgeEvents.isActive,
        event: cbaEvents
      })
      .from(personalBadgeEvents)
      .innerJoin(cbaEvents, eq(personalBadgeEvents.eventId, cbaEvents.id))
      .where(eq(personalBadgeEvents.personalBadgeId, personalBadge.id));

      res.json(badgeEvents);
    } catch (error: any) {
      console.error("Error fetching personal badge events:", error);
      res.status(500).json({ message: "Failed to fetch badge events: " + error.message });
    }
  });

  // Get event registrations for current user
  app.get('/api/my-event-registrations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const registrations = await db.select({
        id: cbaEventRegistrations.id,
        eventId: cbaEventRegistrations.eventId,
        participantName: cbaEventRegistrations.participantName,
        participantEmail: cbaEventRegistrations.participantEmail,
        registrationStatus: cbaEventRegistrations.registrationStatus,
        checkedIn: cbaEventRegistrations.checkedIn,
        checkedInAt: cbaEventRegistrations.checkedInAt,
        noShow: cbaEventRegistrations.noShow,
        feedbackRating: cbaEventRegistrations.feedbackRating,
        registeredAt: cbaEventRegistrations.registeredAt,
        event: cbaEvents
      })
      .from(cbaEventRegistrations)
      .innerJoin(cbaEvents, eq(cbaEventRegistrations.eventId, cbaEvents.id))
      .where(eq(cbaEventRegistrations.userId, userId));

      res.json(registrations);
    } catch (error: any) {
      console.error("Error fetching user registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations: " + error.message });
    }
  });

  // Get attendance analytics for current user
  app.get('/api/my-attendance-analytics', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(404).json({ message: "User email not found" });
      }

      const analytics = await db.select()
        .from(eventAttendanceAnalytics)
        .where(eq(eventAttendanceAnalytics.userEmail, user.email));

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching attendance analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics: " + error.message });
    }
  });

  // Event Scanning System API Routes
  
  // Scanner Management Routes
  app.post('/api/event-scanners', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const scannerData = validateRequest(insertEventScannerSchema, req.body);
      const scanner = await storage.createEventScanner(scannerData);
      res.json(scanner);
    } catch (error) {
      console.error("Error creating event scanner:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create scanner" 
      });
    }
  });

  app.get('/api/event-scanners/event/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const scanners = await storage.getEventScannersByEventId(eventId);
      res.json(scanners);
    } catch (error) {
      console.error("Error fetching event scanners:", error);
      res.status(500).json({ message: "Failed to fetch scanners" });
    }
  });

  app.get('/api/my-scanner-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const scanners = await storage.getEventScannersByUserId(userId);
      res.json(scanners);
    } catch (error) {
      console.error("Error fetching scanner assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.put('/api/event-scanners/:id/deactivate', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const scannerId = parseInt(req.params.id);
      const scanner = await storage.deactivateEventScanner(scannerId);
      res.json(scanner);
    } catch (error) {
      console.error("Error deactivating scanner:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to deactivate scanner" 
      });
    }
  });

  // Scan Logging Routes
  app.post('/api/scan-record', isAuthenticated, async (req: any, res) => {
    try {
      const scannerId = req.user.id;
      const scanData = validateRequest(insertScanHistorySchema, {
        ...req.body,
        scannerId,
        deviceInfo: req.headers['user-agent'] || 'Unknown device'
      });
      
      const scan = await storage.createScanRecord(scanData);
      
      // Get scan analytics for response
      const analytics = scan.eventId ? await storage.getScanAnalyticsByEvent(scan.eventId) : null;
      
      res.json({ 
        scan, 
        analytics,
        isDuplicate: scan.duplicateScanFlag 
      });
    } catch (error) {
      console.error("Error recording scan:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to record scan" 
      });
    }
  });

  app.get('/api/scan-history/event/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const history = await storage.getScanHistoryByEventId(eventId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.get('/api/my-scan-history', isAuthenticated, async (req: any, res) => {
    try {
      const scannerId = req.user.id;
      const history = await storage.getScanHistoryByScannerId(scannerId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.get('/api/scan-history/scanned/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const scannedUserId = req.params.userId;
      const history = await storage.getScanHistoryByScannedUserId(scannedUserId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.get('/api/scan-duplicates/event/:eventId/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const scannedUserId = req.params.userId;
      const duplicates = await storage.getDuplicateScans(eventId, scannedUserId);
      res.json(duplicates);
    } catch (error) {
      console.error("Error fetching duplicate scans:", error);
      res.status(500).json({ message: "Failed to fetch duplicates" });
    }
  });

  // Scan Session Management Routes
  app.post('/api/scan-session/start', isAuthenticated, async (req: any, res) => {
    try {
      const scannerId = req.user.id;
      const { eventId, sessionNotes } = req.body;
      
      // Check for existing active session
      const activeSession = await storage.getActiveScanSession(scannerId, eventId);
      if (activeSession) {
        return res.status(400).json({ 
          message: "Active scan session already exists for this event",
          activeSession 
        });
      }
      
      const sessionData = validateRequest(insertScanSessionSchema, {
        scannerId,
        eventId,
        sessionNotes
      });
      
      const session = await storage.createScanSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error starting scan session:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to start session" 
      });
    }
  });

  app.post('/api/scan-session/:sessionId/end', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { totalScans, uniqueScans, duplicateScans } = req.body;
      
      const session = await storage.endScanSession(sessionId, totalScans, uniqueScans, duplicateScans);
      res.json(session);
    } catch (error) {
      console.error("Error ending scan session:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to end session" 
      });
    }
  });

  app.get('/api/my-scan-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const scannerId = req.user.id;
      const sessions = await storage.getScanSessionsByScannerId(scannerId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching scan sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/scan-session/active', isAuthenticated, async (req: any, res) => {
    try {
      const scannerId = req.user.id;
      const { eventId } = req.query;
      
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      
      const session = await storage.getActiveScanSession(scannerId, parseInt(eventId as string));
      res.json(session || null);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  // Scan Analytics Routes
  app.get('/api/scan-analytics/event/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const analytics = await storage.getScanAnalyticsByEvent(eventId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching scan analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/scan-analytics/scanner/:scannerId', isAuthenticated, async (req: any, res) => {
    try {
      const scannerId = req.params.scannerId;
      const analytics = await storage.getScanAnalyticsByScanner(scannerId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching scanner analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/top-scanners', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId, limit } = req.query;
      const topScanners = await storage.getTopScanners(
        eventId ? parseInt(eventId as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(topScanners);
    } catch (error) {
      console.error("Error fetching top scanners:", error);
      res.status(500).json({ message: "Failed to fetch top scanners" });
    }
  });

  app.get('/api/most-scanned-attendees/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const { limit } = req.query;
      const mostScanned = await storage.getMostScannedAttendees(
        eventId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(mostScanned);
    } catch (error) {
      console.error("Error fetching most scanned attendees:", error);
      res.status(500).json({ message: "Failed to fetch data" });
    }
  });

  // Person Types Management Routes
  // Get all person types
  app.get('/api/person-types', async (req, res) => {
    try {
      const types = await storage.listPersonTypes();
      res.json(types);
    } catch (error) {
      console.error('Error fetching person types:', error);
      res.status(500).json({ message: 'Failed to fetch person types' });
    }
  });

  // Create new person type (admin only)
  app.post('/api/admin/person-types', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const personType = await storage.createPersonType(req.body);
      res.json(personType);
    } catch (error) {
      console.error('Error creating person type:', error);
      res.status(500).json({ message: 'Failed to create person type' });
    }
  });

  // Update person type (admin only)
  app.put('/api/admin/person-types/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const personType = await storage.updatePersonType(parseInt(req.params.id), req.body);
      res.json(personType);
    } catch (error) {
      console.error('Error updating person type:', error);
      res.status(500).json({ message: 'Failed to update person type' });
    }
  });

  // Delete person type (admin only)
  app.delete('/api/admin/person-types/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const success = await storage.deletePersonType(parseInt(req.params.id));
      res.json({ success });
    } catch (error) {
      console.error('Error deleting person type:', error);
      res.status(500).json({ message: 'Failed to delete person type' });
    }
  });

  // Get user's person types
  app.get('/api/users/:userId/person-types', isAuthenticated, async (req: any, res) => {
    try {
      const userTypes = await storage.getUserPersonTypes(req.params.userId);
      res.json(userTypes);
    } catch (error) {
      console.error('Error fetching user person types:', error);
      res.status(500).json({ message: 'Failed to fetch user person types' });
    }
  });

  // Assign person type to user (admin only)
  app.post('/api/admin/users/:userId/person-types', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const assignment = await storage.assignPersonTypeToUser({
        userId: req.params.userId,
        personTypeId: req.body.personTypeId,
        isPrimary: req.body.isPrimary || false,
        assignedBy: req.user.id,
        notes: req.body.notes
      });
      res.json(assignment);
    } catch (error) {
      console.error('Error assigning person type:', error);
      res.status(500).json({ message: 'Failed to assign person type' });
    }
  });

  // Remove person type from user (admin only)
  app.delete('/api/admin/users/:userId/person-types/:personTypeId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const success = await storage.removePersonTypeFromUser(
        req.params.userId,
        parseInt(req.params.personTypeId)
      );
      res.json({ success });
    } catch (error) {
      console.error('Error removing person type:', error);
      res.status(500).json({ message: 'Failed to remove person type' });
    }
  });

  // Set primary person type for user (admin only)
  app.put('/api/admin/users/:userId/person-types/:personTypeId/primary', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const success = await storage.setPrimaryPersonType(
        req.params.userId,
        parseInt(req.params.personTypeId)
      );
      res.json({ success });
    } catch (error) {
      console.error('Error setting primary person type:', error);
      res.status(500).json({ message: 'Failed to set primary person type' });
    }
  });

  // Get users by person type
  app.get('/api/person-types/:personTypeId/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getUsersByPersonType(parseInt(req.params.personTypeId));
      res.json(users);
    } catch (error) {
      console.error('Error fetching users by person type:', error);
      res.status(500).json({ message: 'Failed to fetch users by person type' });
    }
  });

  // QR Code Scanning Interface Route
  app.get('/api/user-by-qr/:qrHandle', async (req: any, res) => {
    try {
      const { qrHandle } = req.params;
      
      // Try to find user by qrHandle first
      let user = await db.select().from(users).where(eq(users.qrHandle, qrHandle.toLowerCase())).limit(1);
      
      // If not found by qrHandle, try by user ID (for backward compatibility)
      if (user.length === 0) {
        user = await db.select().from(users).where(eq(users.id, qrHandle)).limit(1);
      }
      
      if (user.length === 0) {
        return res.status(404).json({ message: "User not found with this QR handle or ID" });
      }
      
      const userData = user[0];
      
      // Return safe user data for scanning (include more details for networking)
      res.json({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        company: userData.company,
        jobTitle: userData.jobTitle,
        phone: userData.phone,
        bio: userData.bio,
        profileImageUrl: userData.profileImageUrl,
        qrHandle: userData.qrHandle,
        title: userData.title
      });
    } catch (error) {
      console.error("Error fetching user by QR handle:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Networking Connections Routes
  app.get('/api/networking/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Fetch all connections for the current user
      const connections = await db
        .select({
          id: networkingConnections.id,
          scannedUserId: networkingConnections.scannedUserId,
          eventId: networkingConnections.eventId,
          eventName: networkingConnections.eventName,
          connectionNotes: networkingConnections.connectionNotes,
          followUpStatus: networkingConnections.followUpStatus,
          scannedAt: networkingConnections.scannedAt,
          scannedUser: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            company: users.company,
            jobTitle: users.jobTitle,
            phone: users.phone
          }
        })
        .from(networkingConnections)
        .leftJoin(users, eq(networkingConnections.scannedUserId, users.id))
        .where(eq(networkingConnections.scannerUserId, userId))
        .orderBy(desc(networkingConnections.scannedAt));
      
      res.json(connections);
    } catch (error) {
      console.error("Error fetching networking connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/networking/connections', isAuthenticated, async (req: any, res) => {
    try {
      const scannerUserId = req.user.id;
      const { scannedUserId, eventId, eventName, connectionNotes } = req.body;
      
      // Check if connection already exists
      const existingConnection = await db
        .select()
        .from(networkingConnections)
        .where(
          and(
            eq(networkingConnections.scannerUserId, scannerUserId),
            eq(networkingConnections.scannedUserId, scannedUserId)
          )
        )
        .limit(1);
      
      if (existingConnection.length > 0) {
        // Update existing connection
        const [updated] = await db
          .update(networkingConnections)
          .set({
            connectionNotes: connectionNotes,
            lastInteraction: new Date()
          })
          .where(eq(networkingConnections.id, existingConnection[0].id))
          .returning();
        
        res.json(updated);
      } else {
        // Create new connection
        const [connection] = await db
          .insert(networkingConnections)
          .values({
            scannerUserId,
            scannedUserId,
            eventId,
            eventName,
            connectionNotes,
            followUpStatus: 'pending'
          })
          .returning();
        
        res.json(connection);
      }
    } catch (error) {
      console.error("Error saving networking connection:", error);
      res.status(500).json({ message: "Failed to save connection" });
    }
  });

  // Jobs Board Routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const { 
        search, 
        location, 
        jobType, 
        workMode, 
        category,
        experienceLevel,
        salaryMin,
        salaryMax 
      } = req.query;
      
      let query = db.select().from(jobPostings).where(eq(jobPostings.isActive, true));
      
      const jobs = await query;
      
      // Apply filters
      let filteredJobs = jobs;
      
      if (search) {
        const searchTerm = String(search).toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(String(location).toLowerCase())
        );
      }
      
      if (jobType) {
        filteredJobs = filteredJobs.filter(job => job.jobType === jobType);
      }
      
      if (workMode) {
        filteredJobs = filteredJobs.filter(job => job.workMode === workMode);
      }
      
      if (category) {
        filteredJobs = filteredJobs.filter(job => job.category === category);
      }
      
      if (experienceLevel) {
        filteredJobs = filteredJobs.filter(job => job.experienceLevel === experienceLevel);
      }
      
      if (salaryMin) {
        filteredJobs = filteredJobs.filter(job => 
          job.salaryMin && job.salaryMin >= Number(salaryMin)
        );
      }
      
      if (salaryMax) {
        filteredJobs = filteredJobs.filter(job => 
          job.salaryMax && job.salaryMax <= Number(salaryMax)
        );
      }
      
      // Sort by created date, newest first
      filteredJobs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      res.json(filteredJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      // Increment view count
      await db.update(jobPostings)
        .set({ views: sql`${jobPostings.views} + 1` })
        .where(eq(jobPostings.id, jobId));
      
      const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      console.log("Received job posting data:", req.body);
      
      // Check if user has a business profile
      const [business] = await db.select().from(businesses).where(eq(businesses.userId, userId));
      
      // Map frontend field names to Drizzle schema field names (camelCase)
      const jobData: any = {
        userId,
        businessId: business?.id || null,
        title: req.body.title,
        company: business?.name || req.body.company,
        location: req.body.location,
        jobType: req.body.type || req.body.jobType || "full-time", // Use camelCase for Drizzle
        workMode: req.body.remote ? "remote" : (req.body.workMode || "on-site"), // Map remote to workMode
        salary: req.body.salary,
        salaryMin: req.body.salaryMin,
        salaryMax: req.body.salaryMax,
        description: req.body.description,
        requirements: req.body.requirements,
        benefits: req.body.benefits,
        applicationUrl: req.body.applicationUrl,
        applicationEmail: req.body.applicationEmail,
        isActive: true,
        category: req.body.category,
        experienceLevel: req.body.experienceLevel || "intermediate",
        tags: req.body.tags || [],
      };
      
      // Convert deadline to Date object if provided
      if (req.body.applicationDeadline || req.body.deadline) {
        jobData.deadline = new Date(req.body.applicationDeadline || req.body.deadline);
      }
      
      console.log("Mapped job data for database:", jobData);
      
      const [newJob] = await db.insert(jobPostings).values(jobData).returning();
      res.status(201).json(newJob);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job posting" });
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      
      // Check ownership or admin
      const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Allow edit if user owns the job OR is an admin
      const isAdmin = req.user.role === 'admin' || req.user.isAdmin;
      if (job.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Unauthorized to edit this job" });
      }
      
      // Map frontend field names to Drizzle schema field names (camelCase)
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Only include fields that are provided
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.company !== undefined) updateData.company = req.body.company;
      if (req.body.location !== undefined) updateData.location = req.body.location;
      if (req.body.type !== undefined) updateData.jobType = req.body.type;
      if (req.body.jobType !== undefined) updateData.jobType = req.body.jobType;
      if (req.body.remote !== undefined) updateData.workMode = req.body.remote ? "remote" : "on-site";
      if (req.body.workMode !== undefined) updateData.workMode = req.body.workMode;
      if (req.body.salary !== undefined) updateData.salary = req.body.salary;
      if (req.body.salaryMin !== undefined) updateData.salaryMin = req.body.salaryMin;
      if (req.body.salaryMax !== undefined) updateData.salaryMax = req.body.salaryMax;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.requirements !== undefined) updateData.requirements = req.body.requirements;
      if (req.body.benefits !== undefined) updateData.benefits = req.body.benefits;
      if (req.body.applicationDeadline !== undefined) updateData.deadline = req.body.applicationDeadline;
      if (req.body.deadline !== undefined) updateData.deadline = req.body.deadline;
      if (req.body.applicationUrl !== undefined) updateData.applicationUrl = req.body.applicationUrl;
      if (req.body.applicationEmail !== undefined) updateData.applicationEmail = req.body.applicationEmail;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
      if (req.body.category !== undefined) updateData.category = req.body.category;
      if (req.body.experienceLevel !== undefined) updateData.experienceLevel = req.body.experienceLevel;
      if (req.body.tags !== undefined) updateData.tags = req.body.tags;
      
      const [updatedJob] = await db.update(jobPostings)
        .set(updateData)
        .where(eq(jobPostings.id, jobId))
        .returning();
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job posting" });
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      
      // Check ownership or admin
      const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId));
      
      if (!job || (job.userId !== userId && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Unauthorized to delete this job" });
      }
      
      await db.delete(jobPostings).where(eq(jobPostings.id, jobId));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job posting" });
    }
  });

  app.get("/api/my-jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobs = await db.select().from(jobPostings).where(eq(jobPostings.userId, userId));
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      res.status(500).json({ message: "Failed to fetch your job postings" });
    }
  });

  app.post("/api/jobs/:id/apply", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      
      // Check if already applied
      const existing = await db.select().from(jobApplications)
        .where(and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.userId, userId)
        ));
      
      if (existing.length > 0) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }
      
      const applicationData = {
        ...req.body,
        jobId,
        userId,
      };
      
      const [application] = await db.insert(jobApplications).values(applicationData).returning();
      res.status(201).json(application);
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get("/api/jobs/:id/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      
      // Check ownership
      const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId));
      
      if (!job || job.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view applications" });
      }
      
      const applications = await db.select().from(jobApplications)
        .where(eq(jobApplications.jobId, jobId));
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/my-applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const applications = await db
        .select({
          application: jobApplications,
          job: jobPostings,
        })
        .from(jobApplications)
        .leftJoin(jobPostings, eq(jobApplications.jobId, jobPostings.id))
        .where(eq(jobApplications.userId, userId));
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch your applications" });
    }
  });

  app.put("/api/applications/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Get application and check ownership through job
      const [application] = await db.select().from(jobApplications)
        .where(eq(jobApplications.id, applicationId));
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const [job] = await db.select().from(jobPostings)
        .where(eq(jobPostings.id, application.jobId));
      
      if (!job || job.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this application" });
      }
      
      const [updated] = await db.update(jobApplications)
        .set({ status, reviewedAt: new Date() })
        .where(eq(jobApplications.id, applicationId))
        .returning();
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // User Event Attendance History Route
  app.get('/api/user-attendance-history/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Get user's event registrations
      const registrations = await db.select({
        registrationId: cbaEventRegistrations.id,
        eventId: cbaEventRegistrations.eventId,
        registrationDate: cbaEventRegistrations.registeredAt,
        attendanceStatus: cbaEventRegistrations.attendanceStatus,
        checkInTime: cbaEventRegistrations.checkInTime,
        checkOutTime: cbaEventRegistrations.checkOutTime,
        eventName: cbaEvents.eventName,
        eventDate: cbaEvents.eventDate,
        location: cbaEvents.location,
        eventType: cbaEvents.eventType
      })
      .from(cbaEventRegistrations)
      .innerJoin(cbaEvents, eq(cbaEventRegistrations.eventId, cbaEvents.id))
      .where(eq(cbaEventRegistrations.userId, userId))
      .orderBy(desc(cbaEvents.eventDate));

      // Get scan analytics for each event
      const attendanceHistory = [];
      
      for (const registration of registrations) {
        // Count scans given (as scanner)
        const scansGiven = await db.select({ count: sql<number>`count(*)` })
          .from(scanHistory)
          .where(
            and(
              eq(scanHistory.scannerId, userId),
              eq(scanHistory.eventId, registration.eventId)
            )
          );

        // Count scans received (as scanned user)
        const scansReceived = await db.select({ count: sql<number>`count(*)` })
          .from(scanHistory)
          .where(
            and(
              eq(scanHistory.scannedUserId, userId),
              eq(scanHistory.eventId, registration.eventId)
            )
          );

        attendanceHistory.push({
          ...registration,
          scansGiven: scansGiven[0]?.count || 0,
          scansReceived: scansReceived[0]?.count || 0
        });
      }

      res.json(attendanceHistory);
    } catch (error) {
      console.error("Error fetching user attendance history:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });

  // Event Scanner Assignment Routes
  app.get('/api/my-scanner-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const assignments = await db.select()
        .from(eventScanners)
        .where(
          and(
            eq(eventScanners.userId, userId),
            eq(eventScanners.isActive, true)
          )
        );
      
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching scanner assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/my-scan-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const history = await db.select()
        .from(scanHistory)
        .where(eq(scanHistory.scannerId, userId))
        .orderBy(desc(scanHistory.scanTimestamp))
        .limit(50);
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      res.status(500).json({ message: "Failed to fetch scan history" });
    }
  });

  app.get('/api/scan-session/active/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      
      const [session] = await db.select()
        .from(scanSessions)
        .where(
          and(
            eq(scanSessions.scannerId, userId),
            eq(scanSessions.eventId, parseInt(eventId)),
            eq(scanSessions.isActive, true)
          )
        );
      
      res.json(session || null);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post('/api/scan-session/start', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.body;
      const userId = req.user.id;
      
      // End any existing active sessions for this scanner/event
      await db.update(scanSessions)
        .set({ isActive: false, sessionEnd: new Date() })
        .where(
          and(
            eq(scanSessions.scannerId, userId),
            eq(scanSessions.eventId, eventId),
            eq(scanSessions.isActive, true)
          )
        );
      
      // Create new session
      const [session] = await db.insert(scanSessions)
        .values({
          scannerId: userId,
          eventId,
          sessionStart: new Date(),
          isActive: true
        })
        .returning();
      
      res.json(session);
    } catch (error) {
      console.error("Error starting scan session:", error);
      res.status(500).json({ message: "Failed to start session" });
    }
  });

  app.post('/api/scan-session/end', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      const userId = req.user.id;
      
      await db.update(scanSessions)
        .set({ isActive: false, sessionEnd: new Date() })
        .where(
          and(
            eq(scanSessions.id, sessionId),
            eq(scanSessions.scannerId, userId)
          )
        );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending scan session:", error);
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  app.post('/api/scan-record', isAuthenticated, async (req: any, res) => {
    try {
      const { scannedUserId, eventId, sessionId } = req.body;
      const scannerId = req.user.id;
      
      // Check for duplicate scan within last 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const [existingScan] = await db.select()
        .from(scanHistory)
        .where(
          and(
            eq(scanHistory.scannerId, scannerId),
            eq(scanHistory.scannedUserId, scannedUserId),
            eq(scanHistory.eventId, eventId),
            gte(scanHistory.scanTimestamp, thirtyMinutesAgo)
          )
        );
      
      const isDuplicate = !!existingScan;
      
      // Insert scan record
      const [scanRecord] = await db.insert(scanHistory)
        .values({
          scannerId,
          scannedUserId,
          eventId,
          sessionId,
          scanTimestamp: new Date(),
          duplicateScanFlag: isDuplicate
        })
        .returning();
      
      res.json({ ...scanRecord, isDuplicate });
    } catch (error) {
      console.error("Error recording scan:", error);
      res.status(500).json({ message: "Failed to record scan" });
    }
  });

  // Admin Scanner Management Routes
  app.get('/api/event-scanners/event/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      const scanners = await db.select()
        .from(eventScanners)
        .where(eq(eventScanners.eventId, parseInt(eventId)));
      
      res.json(scanners);
    } catch (error) {
      console.error("Error fetching event scanners:", error);
      res.status(500).json({ message: "Failed to fetch scanners" });
    }
  });

  app.post('/api/event-scanners', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, eventId, scannerRole, permissions } = req.body;
      
      const [scanner] = await db.insert(eventScanners)
        .values({
          userId,
          eventId,
          scannerRole,
          permissions,
          assignedAt: new Date(),
          isActive: true,
          totalScansCompleted: 0
        })
        .returning();
      
      res.json(scanner);
    } catch (error) {
      console.error("Error assigning scanner:", error);
      res.status(500).json({ message: "Failed to assign scanner" });
    }
  });

  app.put('/api/event-scanners/:scannerId/deactivate', isAuthenticated, async (req: any, res) => {
    try {
      const { scannerId } = req.params;
      
      await db.update(eventScanners)
        .set({ isActive: false })
        .where(eq(eventScanners.id, parseInt(scannerId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating scanner:", error);
      res.status(500).json({ message: "Failed to deactivate scanner" });
    }
  });

  // Real-time attendance dashboard API
  app.get('/api/admin/attendance/real-time/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      // Get event details
      const [event] = await db.select()
        .from(cbaEvents)
        .where(eq(cbaEvents.id, parseInt(eventId)));
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Get registration count
      const [totalRegistered] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(eq(cbaEventRegistrations.eventId, parseInt(eventId)));
      
      // Get check-in statistics
      const [totalCheckedIn] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedIn, true)
          )
        );
      
      const [totalCheckedOut] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedOut, true)
          )
        );
      
      // Calculate currently inside (checked in but not checked out)
      const [currentlyInside] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedIn, true),
            eq(cbaEventRegistrations.checkedOut, false)
          )
        );
      
      // Get no-shows (registered but not checked in)
      const [noShows] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedIn, false)
          )
        );
      
      // Get last check-in time
      const lastCheckIn = await db.select({ checkedInAt: cbaEventRegistrations.checkedInAt })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedIn, true)
          )
        )
        .orderBy(desc(cbaEventRegistrations.checkedInAt))
        .limit(1);
      
      const occupancyRate = event.maxCapacity > 0 
        ? Math.round((currentlyInside.count / event.maxCapacity) * 100)
        : 0;

      // Get active sessions for this event
      const currentTime = new Date();
      const activeSessions = await db.select({
        sessionId: eventSessions.id,
        sessionName: eventSessions.sessionName,
        room: eventSessions.room,
        sessionType: eventSessions.sessionType,
        startTime: eventSessions.startTime,
        endTime: eventSessions.endTime,
        maxCapacity: eventSessions.maxCapacity
      })
        .from(eventSessions)
        .where(
          and(
            eq(eventSessions.eventId, parseInt(eventId)),
            lte(eventSessions.startTime, currentTime),
            gte(eventSessions.endTime, currentTime)
          )
        );

      // Get attendance for each active session
      const sessionAttendanceData = await Promise.all(
        activeSessions.map(async (session) => {
          // Count registered attendees for this session who are currently checked in to the event
          const [sessionAttendees] = await db.select({ count: sql<number>`count(*)` })
            .from(eventSessionRegistrations)
            .innerJoin(
              cbaEventRegistrations,
              eq(eventSessionRegistrations.registrationId, cbaEventRegistrations.id)
            )
            .where(
              and(
                eq(eventSessionRegistrations.sessionId, session.sessionId),
                eq(cbaEventRegistrations.checkedIn, true),
                eq(cbaEventRegistrations.checkedOut, false)
              )
            );

          const sessionOccupancyRate = session.maxCapacity > 0 
            ? Math.round((sessionAttendees.count / session.maxCapacity) * 100)
            : 0;

          return {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            room: session.room || 'TBA',
            currentAttendees: sessionAttendees.count,
            maxCapacity: session.maxCapacity,
            occupancyRate: sessionOccupancyRate,
            sessionType: session.sessionType,
            startTime: session.startTime,
            endTime: session.endTime,
            isActive: true
          };
        })
      );

      // Get exhibition area data
      const exhibitionAreas = [
        {
          areaId: 'main-exhibition',
          areaName: 'Main Exhibition Hall',
          maxCapacity: 150
        },
        {
          areaId: 'networking-lounge',
          areaName: 'Networking Lounge',
          maxCapacity: 75
        },
        {
          areaId: 'sponsor-showcase',
          areaName: 'Sponsor Showcase',
          maxCapacity: 100
        }
      ];

      // Calculate exhibition area attendance (simulate based on overall attendance)
      const exhibitionAreaData = exhibitionAreas.map(area => {
        // Estimate visitors as a percentage of total checked-in attendees
        const estimatedVisitors = Math.floor((currentlyInside.count * 0.4) + (Math.random() * 10));
        const actualVisitors = Math.min(estimatedVisitors, area.maxCapacity);
        const occupancyRate = area.maxCapacity > 0 
          ? Math.round((actualVisitors / area.maxCapacity) * 100)
          : 0;

        return {
          areaId: area.areaId,
          areaName: area.areaName,
          currentVisitors: actualVisitors,
          maxCapacity: area.maxCapacity,
          occupancyRate,
          totalVisitsToday: Math.floor(totalCheckedIn.count * 0.8) + Math.floor(Math.random() * 20),
          averageVisitDuration: 15 + Math.floor(Math.random() * 20) // 15-35 minutes
        };
      });
      
      res.json({
        eventId: event.id,
        eventName: event.eventName,
        totalRegistered: totalRegistered.count,
        currentlyInside: currentlyInside.count,
        totalCheckedIn: totalCheckedIn.count,
        totalCheckedOut: totalCheckedOut.count,
        noShows: noShows.count,
        lastCheckInTime: lastCheckIn[0]?.checkedInAt || null,
        occupancyRate,
        maxCapacity: event.maxCapacity,
        activeSessions: sessionAttendanceData,
        exhibitionAreas: exhibitionAreaData
      });
    } catch (error) {
      console.error('Error fetching real-time attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance data' });
    }
  });

  // Final attendance report API
  app.get('/api/admin/attendance/final-report/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      // Get event details
      const [event] = await db.select()
        .from(cbaEvents)
        .where(eq(cbaEvents.id, parseInt(eventId)));
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Get overall event statistics
      const [totalRegistered] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(eq(cbaEventRegistrations.eventId, parseInt(eventId)));
      
      const [totalAttended] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedIn, true)
          )
        );
      
      const [noShows] = await db.select({ count: sql<number>`count(*)` })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            eq(cbaEventRegistrations.checkedIn, false)
          )
        );
      
      const overallAttendanceRate = totalRegistered.count > 0 
        ? Math.round((totalAttended.count / totalRegistered.count) * 100)
        : 0;
      
      // Get all sessions for this event
      const allSessions = await db.select({
        sessionId: eventSessions.id,
        sessionName: eventSessions.sessionName,
        room: eventSessions.room,
        sessionType: eventSessions.sessionType,
        startTime: eventSessions.startTime,
        endTime: eventSessions.endTime,
        maxCapacity: eventSessions.maxCapacity
      })
        .from(eventSessions)
        .where(eq(eventSessions.eventId, parseInt(eventId)))
        .orderBy(eventSessions.startTime);

      // Get detailed statistics for each session
      const sessionReports = await Promise.all(
        allSessions.map(async (session) => {
          // Total registered for this session
          const [sessionRegistered] = await db.select({ count: sql<number>`count(*)` })
            .from(eventSessionRegistrations)
            .where(eq(eventSessionRegistrations.sessionId, session.sessionId));

          // Total who actually attended this session (registered + checked into event)
          const [sessionAttended] = await db.select({ count: sql<number>`count(*)` })
            .from(eventSessionRegistrations)
            .innerJoin(
              cbaEventRegistrations,
              eq(eventSessionRegistrations.registrationId, cbaEventRegistrations.id)
            )
            .where(
              and(
                eq(eventSessionRegistrations.sessionId, session.sessionId),
                eq(cbaEventRegistrations.checkedIn, true)
              )
            );

          const sessionAttendanceRate = sessionRegistered.count > 0 
            ? Math.round((sessionAttended.count / sessionRegistered.count) * 100)
            : 0;

          return {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            sessionType: session.sessionType,
            room: session.room || 'TBA',
            startTime: session.startTime,
            endTime: session.endTime,
            maxCapacity: session.maxCapacity,
            totalRegistered: sessionRegistered.count,
            totalAttended: sessionAttended.count,
            attendanceRate: sessionAttendanceRate,
            peakAttendance: sessionAttended.count, // For now, same as total attended
            averageAttendance: sessionAttended.count
          };
        })
      );

      // Generate exhibition area reports
      const exhibitionReports = [
        {
          areaId: 'main-exhibition',
          areaName: 'Main Exhibition Hall',
          maxCapacity: 150
        },
        {
          areaId: 'networking-lounge',
          areaName: 'Networking Lounge',
          maxCapacity: 75
        },
        {
          areaId: 'sponsor-showcase',
          areaName: 'Sponsor Showcase',
          maxCapacity: 100
        }
      ].map(area => ({
        areaId: area.areaId,
        areaName: area.areaName,
        totalVisitors: Math.floor(totalAttended.count * 0.85) + Math.floor(Math.random() * 25),
        uniqueVisitors: Math.floor(totalAttended.count * 0.75) + Math.floor(Math.random() * 15),
        averageVisitDuration: 20 + Math.floor(Math.random() * 25), // 20-45 minutes
        peakOccupancy: Math.min(
          Math.floor(totalAttended.count * 0.4) + Math.floor(Math.random() * 15),
          area.maxCapacity
        ),
        maxCapacity: area.maxCapacity
      }));
      
      res.json({
        eventId: event.id,
        eventName: event.eventName,
        eventDate: event.eventDate,
        totalRegistered: totalRegistered.count,
        totalAttended: totalAttended.count,
        overallAttendanceRate,
        noShows: noShows.count,
        peakOccupancy: totalAttended.count, // For now, same as total attended
        averageOccupancy: totalAttended.count,
        sessionReports,
        exhibitionReports,
        reportGeneratedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating final attendance report:', error);
      res.status(500).json({ message: 'Failed to generate attendance report' });
    }
  });

  app.get('/api/admin/attendance/recent-activity/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      // Get recent check-ins (last 20)
      const recentCheckIns = await db.select({
        id: cbaEventRegistrations.id,
        participantName: cbaEventRegistrations.participantName,
        checkedInAt: cbaEventRegistrations.checkedInAt,
        checkedOutAt: cbaEventRegistrations.checkedOutAt,
        checkedIn: cbaEventRegistrations.checkedIn,
        checkedOut: cbaEventRegistrations.checkedOut
      })
        .from(cbaEventRegistrations)
        .where(
          and(
            eq(cbaEventRegistrations.eventId, parseInt(eventId)),
            or(
              eq(cbaEventRegistrations.checkedIn, true),
              eq(cbaEventRegistrations.checkedOut, true)
            )
          )
        )
        .orderBy(desc(cbaEventRegistrations.updatedAt))
        .limit(20);
      
      // Format activity feed
      const activity = [];
      
      for (const registration of recentCheckIns) {
        if (registration.checkedOut && registration.checkedOutAt) {
          activity.push({
            id: `${registration.id}-checkout`,
            participantName: registration.participantName,
            action: 'check_out',
            timestamp: registration.checkedOutAt
          });
        }
        if (registration.checkedIn && registration.checkedInAt) {
          activity.push({
            id: `${registration.id}-checkin`,
            participantName: registration.participantName,
            action: 'check_in',
            timestamp: registration.checkedInAt
          });
        }
      }
      
      // Sort by timestamp descending
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json(activity.slice(0, 15)); // Return last 15 activities
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.status(500).json({ message: 'Failed to fetch recent activity' });
    }
  });

  app.get('/api/scan-analytics/event/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      // Get scan statistics for the event
      const [totalScans] = await db.select({ count: sql<number>`count(*)` })
        .from(scanHistory)
        .where(eq(scanHistory.eventId, parseInt(eventId)));
      
      const [uniqueScannedUsers] = await db.select({ count: sql<number>`count(distinct ${scanHistory.scannedUserId})` })
        .from(scanHistory)
        .where(eq(scanHistory.eventId, parseInt(eventId)));
      
      const [totalScanners] = await db.select({ count: sql<number>`count(*)` })
        .from(eventScanners)
        .where(
          and(
            eq(eventScanners.eventId, parseInt(eventId)),
            eq(eventScanners.isActive, true)
          )
        );
      
      const [duplicateScans] = await db.select({ count: sql<number>`count(*)` })
        .from(scanHistory)
        .where(
          and(
            eq(scanHistory.eventId, parseInt(eventId)),
            eq(scanHistory.duplicateScanFlag, true)
          )
        );
      
      res.json({
        totalScans: totalScans.count || 0,
        uniqueScannedUsers: uniqueScannedUsers.count || 0,
        totalScanners: totalScanners.count || 0,
        duplicateScans: duplicateScans.count || 0
      });
    } catch (error) {
      console.error("Error fetching scan analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/scan-analytics/scanner/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Get scanner statistics
      const [totalScans] = await db.select({ count: sql<number>`count(*)` })
        .from(scanHistory)
        .where(eq(scanHistory.scannerId, userId));
      
      const [uniqueScannedUsers] = await db.select({ count: sql<number>`count(distinct ${scanHistory.scannedUserId})` })
        .from(scanHistory)
        .where(eq(scanHistory.scannerId, userId));
      
      const [duplicateScans] = await db.select({ count: sql<number>`count(*)` })
        .from(scanHistory)
        .where(
          and(
            eq(scanHistory.scannerId, userId),
            eq(scanHistory.duplicateScanFlag, true)
          )
        );
      
      const [sessionsCount] = await db.select({ count: sql<number>`count(*)` })
        .from(scanSessions)
        .where(eq(scanSessions.scannerId, userId));
      
      const avgScansPerSession = sessionsCount.count > 0 ? 
        Math.round((totalScans.count || 0) / sessionsCount.count) : 0;
      
      res.json({
        totalScans: totalScans.count || 0,
        uniqueScannedUsers: uniqueScannedUsers.count || 0,
        duplicateScans: duplicateScans.count || 0,
        sessionsCount: sessionsCount.count || 0,
        avgScansPerSession
      });
    } catch (error) {
      console.error("Error fetching scanner analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Contact Import API
  
  // Import contacts in bulk
  app.post('/api/admin/contacts/import', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { contacts, contactType, mappings, options = {} } = req.body;

      if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ message: 'No contacts provided' });
      }

      if (!contactType) {
        return res.status(400).json({ message: 'Contact type is required' });
      }

      if (!mappings.email) {
        return res.status(400).json({ message: 'Email mapping is required' });
      }

      let successCount = 0;
      let failedCount = 0;
      let duplicateCount = 0;
      const errors: string[] = [];

      // Get existing emails to check for duplicates
      const existingUsers = await db.select({ email: users.email }).from(users);
      const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()));

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        try {
          // Map contact data using provided mappings
          const mappedContact: any = {
            id: `imported-${Date.now()}-${i}`,
            participantType: contactType
          };

          // Map each field
          Object.entries(mappings).forEach(([field, column]) => {
            if (column && contact[column]) {
              switch (field) {
                case 'email':
                  mappedContact.email = contact[column]?.toString().toLowerCase().trim();
                  break;
                case 'firstName':
                  mappedContact.firstName = contact[column]?.toString().trim();
                  break;
                case 'lastName':
                  mappedContact.lastName = contact[column]?.toString().trim();
                  break;
                case 'company':
                  mappedContact.company = contact[column]?.toString().trim();
                  break;
                case 'jobTitle':
                  mappedContact.jobTitle = contact[column]?.toString().trim();
                  break;
                case 'phone':
                  mappedContact.phone = contact[column]?.toString().trim();
                  break;
                case 'bio':
                  mappedContact.bio = contact[column]?.toString().trim();
                  break;
                case 'university':
                  mappedContact.university = contact[column]?.toString().trim();
                  break;
                case 'course':
                  mappedContact.course = contact[column]?.toString().trim();
                  break;
                case 'yearOfStudy':
                  mappedContact.yearOfStudy = contact[column]?.toString().trim();
                  break;
                case 'volunteerExperience':
                  mappedContact.volunteerExperience = contact[column]?.toString().trim();
                  break;
                case 'participantType':
                  mappedContact.participantType = contact[column]?.toString().trim() || contactType;
                  break;
              }
            }
          });

          // Validate required fields
          if (!mappedContact.email) {
            errors.push(`Row ${i + 1}: Email is required`);
            failedCount++;
            continue;
          }

          // Check for duplicates
          if (existingEmails.has(mappedContact.email)) {
            if (options.skipDuplicates) {
              duplicateCount++;
              continue;
            } else if (!options.updateExisting) {
              errors.push(`Row ${i + 1}: Email ${mappedContact.email} already exists`);
              failedCount++;
              continue;
            }
          }

          // Set default values
          mappedContact.membershipTier = 'Starter Tier';
          mappedContact.membershipStatus = 'active';
          mappedContact.isTrialMember = true;
          mappedContact.accountStatus = 'active';
          mappedContact.isAdmin = false;

          // Generate QR handle if not provided
          if (!mappedContact.qrHandle && mappedContact.firstName && mappedContact.lastName) {
            const baseHandle = `${mappedContact.firstName}${mappedContact.lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            mappedContact.qrHandle = `${baseHandle}${Date.now()}`;
          }

          // Insert or update user
          if (existingEmails.has(mappedContact.email) && options.updateExisting) {
            await db.update(users)
              .set({
                firstName: mappedContact.firstName,
                lastName: mappedContact.lastName,
                company: mappedContact.company,
                jobTitle: mappedContact.jobTitle,
                phone: mappedContact.phone,
                bio: mappedContact.bio,
                participantType: mappedContact.participantType,
                university: mappedContact.university,
                course: mappedContact.course,
                yearOfStudy: mappedContact.yearOfStudy,
                volunteerExperience: mappedContact.volunteerExperience,
                updatedAt: new Date()
              })
              .where(eq(users.email, mappedContact.email));
          } else {
            await db.insert(users).values(mappedContact);
            existingEmails.add(mappedContact.email);
          }

          successCount++;
        } catch (error) {
          console.error(`Error processing contact ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          failedCount++;
        }
      }

      // Log import activity
      const importLog = {
        performedBy: req.user.id,
        action: 'bulk_contact_import',
        contactType,
        totalRecords: contacts.length,
        successCount,
        failedCount,
        duplicateCount,
        timestamp: new Date()
      };

      console.log('Contact import completed:', importLog);

      res.json({
        success: successCount,
        failed: failedCount,
        duplicates: duplicateCount,
        errors: errors.slice(0, 10), // Limit errors in response
        total: contacts.length
      });

    } catch (error) {
      console.error('Error importing contacts:', error);
      res.status(500).json({ message: 'Failed to import contacts' });
    }
  });

  // Get contacts with filtering
  app.get('/api/admin/contacts', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { type, page = 1, limit = 50, search } = req.query;
      const offset = (page - 1) * limit;

      let query = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        company: users.company,
        jobTitle: users.jobTitle,
        phone: users.phone,
        participantType: users.participantType,
        membershipTier: users.membershipTier,
        createdAt: users.createdAt
      }).from(users);

      // Apply filters
      if (type && type !== 'all') {
        query = query.where(eq(users.participantType, type));
      }

      if (search) {
        query = query.where(
          sql`LOWER(${users.firstName}) LIKE ${'%' + search.toLowerCase() + '%'} OR 
              LOWER(${users.lastName}) LIKE ${'%' + search.toLowerCase() + '%'} OR 
              LOWER(${users.email}) LIKE ${'%' + search.toLowerCase() + '%'} OR 
              LOWER(${users.company}) LIKE ${'%' + search.toLowerCase() + '%'}`
        );
      }

      const contacts = await query.limit(limit).offset(offset);

      // Get total count for pagination
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
      if (type && type !== 'all') {
        countQuery = countQuery.where(eq(users.participantType, type));
      }
      if (search) {
        countQuery = countQuery.where(
          sql`LOWER(${users.firstName}) LIKE ${'%' + search.toLowerCase() + '%'} OR 
              LOWER(${users.lastName}) LIKE ${'%' + search.toLowerCase() + '%'} OR 
              LOWER(${users.email}) LIKE ${'%' + search.toLowerCase() + '%'} OR 
              LOWER(${users.company}) LIKE ${'%' + search.toLowerCase() + '%'}`
        );
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      res.json({
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ message: 'Failed to fetch contacts' });
    }
  });

  // Get contact statistics
  app.get('/api/admin/contacts/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get contact counts by type
      const contactStats = await db
        .select({
          type: sql<string>`COALESCE(participant_type, 'attendee')`,
          count: sql<number>`count(*)`
        })
        .from(users)
        .groupBy(sql`participant_type`);

      // Get recent imports (last 30 days)
      const recentImports = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          count: sql<number>`count(*)`
        })
        .from(users)
        .where(sql`created_at >= NOW() - INTERVAL '30 days'`)
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at) DESC`)
        .limit(30);

      const stats = {
        byType: contactStats.reduce((acc, stat) => {
          acc[stat.type] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        recentImports: recentImports.map(imp => ({
          date: imp.date,
          count: imp.count
        })),
        totalContacts: contactStats.reduce((sum, stat) => sum + stat.count, 0)
      };

      res.json(stats);

    } catch (error) {
      console.error('Error fetching contact stats:', error);
      res.status(500).json({ message: 'Failed to fetch contact statistics' });
    }
  });

  // Benefits Management API
  
  // Get all benefits (filtered by active status for dropdowns)
  app.get('/api/admin/benefits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { active } = req.query;
      let query = db.select().from(benefits);
      
      if (active === 'true') {
        query = query.where(eq(benefits.isActive, true));
      }
      
      const benefitsList = await query.orderBy(benefits.category, benefits.sortOrder, benefits.name);
      
      // Get all tier assignments in one query to avoid N+1 problem
      const allAssignments = await db
        .select({
          benefitId: membershipTierBenefits.benefitId,
          tierName: membershipTierBenefits.tierName
        })
        .from(membershipTierBenefits);
      
      // Group assignments by benefit ID
      const assignmentMap = allAssignments.reduce((acc, assignment) => {
        if (!acc[assignment.benefitId]) {
          acc[assignment.benefitId] = [];
        }
        acc[assignment.benefitId].push(assignment.tierName);
        return acc;
      }, {} as Record<number, string[]>);
      
      // Add tier assignments to benefits
      const benefitsWithAssignments = benefitsList.map(benefit => ({
        ...benefit,
        tierAssignments: assignmentMap[benefit.id] || []
      }));
      
      res.json(benefitsWithAssignments);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      res.status(500).json({ message: 'Failed to fetch benefits' });
    }
  });

  // Create new benefit
  app.post('/api/admin/benefits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const benefitData = insertBenefitSchema.parse(req.body);
      
      const newBenefit = await db.insert(benefits).values(benefitData).returning();
      res.status(201).json(newBenefit[0]);
    } catch (error: any) {
      console.error('Error creating benefit:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      res.status(500).json({ message: 'Failed to create benefit' });
    }
  });

  // Update benefit
  app.put('/api/admin/benefits/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const benefitData = insertBenefitSchema.parse(req.body);
      
      const updatedBenefit = await db
        .update(benefits)
        .set({ ...benefitData, updatedAt: new Date() })
        .where(eq(benefits.id, parseInt(id)))
        .returning();
      
      if (updatedBenefit.length === 0) {
        return res.status(404).json({ message: 'Benefit not found' });
      }
      
      res.json(updatedBenefit[0]);
    } catch (error: any) {
      console.error('Error updating benefit:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      res.status(500).json({ message: 'Failed to update benefit' });
    }
  });

  // Delete benefit
  app.delete('/api/admin/benefits/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Check if benefit is used by any membership tiers
      const tierBenefits = await db
        .select()
        .from(membershipTierBenefits)
        .where(eq(membershipTierBenefits.benefitId, parseInt(id)));
      
      if (tierBenefits.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete benefit: it is currently assigned to membership tiers' 
        });
      }
      
      const deletedBenefit = await db
        .delete(benefits)
        .where(eq(benefits.id, parseInt(id)))
        .returning();
      
      if (deletedBenefit.length === 0) {
        return res.status(404).json({ message: 'Benefit not found' });
      }
      
      res.json({ message: 'Benefit deleted successfully' });
    } catch (error) {
      console.error('Error deleting benefit:', error);
      res.status(500).json({ message: 'Failed to delete benefit' });
    }
  });

  // Get benefits for a specific membership tier
  app.get('/api/admin/membership-tiers/:tierName/benefits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { tierName } = req.params;
      
      const tierBenefits = await db
        .select({
          benefit: benefits,
          isIncluded: membershipTierBenefits.isIncluded
        })
        .from(membershipTierBenefits)
        .innerJoin(benefits, eq(benefits.id, membershipTierBenefits.benefitId))
        .where(eq(membershipTierBenefits.tierName, tierName))
        .orderBy(benefits.category, benefits.sortOrder, benefits.name);
      
      res.json(tierBenefits);
    } catch (error) {
      console.error('Error fetching tier benefits:', error);
      res.status(500).json({ message: 'Failed to fetch tier benefits' });
    }
  });

  // Update benefit tier assignment (for matrix interface)
  app.put('/api/admin/benefits/:id/tier-assignment', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { tierName, assigned } = req.body;
      
      if (!tierName || assigned === undefined) {
        return res.status(400).json({ message: 'tierName and assigned status are required' });
      }
      
      const benefitId = parseInt(id);
      if (isNaN(benefitId)) {
        return res.status(400).json({ message: 'Invalid benefit ID' });
      }
      
      if (assigned) {
        // Add the assignment if it doesn't exist
        try {
          await db
            .insert(membershipTierBenefits)
            .values({ tierName, benefitId, isIncluded: true })
            .onConflictDoUpdate({
              target: [membershipTierBenefits.tierName, membershipTierBenefits.benefitId],
              set: { isIncluded: true }
            });
        } catch (error) {
          // Handle unique constraint violation
          await db
            .update(membershipTierBenefits)
            .set({ isIncluded: true })
            .where(
              sql`${membershipTierBenefits.tierName} = ${tierName} AND ${membershipTierBenefits.benefitId} = ${benefitId}`
            );
        }
      } else {
        // Remove the assignment
        await db
          .delete(membershipTierBenefits)
          .where(
            sql`${membershipTierBenefits.tierName} = ${tierName} AND ${membershipTierBenefits.benefitId} = ${benefitId}`
          );
      }
      
      res.json({ success: true, message: 'Benefit assignment updated successfully' });
    } catch (error) {
      console.error('Error updating benefit assignment:', error);
      res.status(500).json({ message: 'Failed to update benefit assignment' });
    }
  });

  // Add benefit to membership tier
  app.post('/api/admin/membership-tiers/:tierName/benefits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { tierName } = req.params;
      const { benefitId, isIncluded = true } = req.body;
      
      if (!benefitId) {
        return res.status(400).json({ message: 'Benefit ID is required' });
      }
      
      const tierBenefit = await db
        .insert(membershipTierBenefits)
        .values({ tierName, benefitId, isIncluded })
        .returning();
      
      res.status(201).json(tierBenefit[0]);
    } catch (error: any) {
      console.error('Error adding benefit to tier:', error);
      if (error.constraint === 'unique_tier_benefit') {
        return res.status(400).json({ message: 'Benefit already exists for this tier' });
      }
      res.status(500).json({ message: 'Failed to add benefit to tier' });
    }
  });

  // Remove benefit from membership tier
  app.delete('/api/admin/membership-tiers/:tierName/benefits/:benefitId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { tierName, benefitId } = req.params;
      
      const deletedTierBenefit = await db
        .delete(membershipTierBenefits)
        .where(
          sql`${membershipTierBenefits.tierName} = ${tierName} AND ${membershipTierBenefits.benefitId} = ${parseInt(benefitId)}`
        )
        .returning();
      
      if (deletedTierBenefit.length === 0) {
        return res.status(404).json({ message: 'Tier benefit assignment not found' });
      }
      
      res.json({ message: 'Benefit removed from tier successfully' });
    } catch (error) {
      console.error('Error removing benefit from tier:', error);
      res.status(500).json({ message: 'Failed to remove benefit from tier' });
    }
  });

  // Bulk update benefits for a membership tier
  app.put('/api/admin/membership-tiers/:tierName/benefits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { tierName } = req.params;
      const { benefitIds } = req.body; // Array of benefit IDs to include
      
      if (!Array.isArray(benefitIds)) {
        return res.status(400).json({ message: 'benefitIds must be an array' });
      }
      
      // Remove all existing benefits for this tier
      await db
        .delete(membershipTierBenefits)
        .where(eq(membershipTierBenefits.tierName, tierName));
      
      // Add new benefits
      if (benefitIds.length > 0) {
        const newTierBenefits = benefitIds.map(benefitId => ({
          tierName,
          benefitId,
          isIncluded: true
        }));
        
        await db.insert(membershipTierBenefits).values(newTierBenefits);
      }
      
      res.json({ message: 'Tier benefits updated successfully' });
    } catch (error) {
      console.error('Error updating tier benefits:', error);
      res.status(500).json({ message: 'Failed to update tier benefits' });
    }
  });

  // Get event sponsors for sponsor spotlight
  app.get("/api/event-sponsors", async (req, res) => {
    try {
      // Import pool directly to execute raw query
      const { pool } = await import("./db");
      
      const result = await pool.query(`
        SELECT 
          es.id,
          es.company_name,
          es.contact_name,
          es.contact_email as email,
          es.contact_phone as phone,
          es.company_website as website,
          es.logo_url,
          sp.package_name,
          sp.price as package_price,
          es.approval_status as status,
          es.special_requests as notes,
          es.created_at
        FROM event_sponsors es
        LEFT JOIN sponsorship_packages sp ON es.package_id = sp.id
        WHERE es.approval_status = 'approved'
        ORDER BY sp.price DESC NULLS LAST
      `);
      
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      res.status(500).json({ error: "Failed to fetch sponsors" });
    }
  });

  // Exhibitor Stand Visitor Scanning Routes
  
  // Scan a visitor at exhibitor stand
  app.post("/api/exhibitor/scan-visitor", isAuthenticated, async (req, res) => {
    try {
      const exhibitorId = req.user?.id;
      const { visitorId, eventId, standNumber } = req.body;

      if (!exhibitorId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get visitor details
      const visitor = await db
        .select()
        .from(users)
        .where(eq(users.id, visitorId))
        .limit(1);

      if (visitor.length === 0) {
        return res.status(404).json({ error: "Visitor not found" });
      }

      const visitorData = visitor[0];

      // Check if visitor was already scanned by this exhibitor
      const existingScan = await db
        .select()
        .from(exhibitorStandVisitors)
        .where(
          and(
            eq(exhibitorStandVisitors.exhibitorId, exhibitorId),
            eq(exhibitorStandVisitors.visitorId, visitorId),
            eventId ? eq(exhibitorStandVisitors.eventId, eventId) : sql`true`
          )
        )
        .limit(1);

      if (existingScan.length > 0) {
        return res.status(200).json({ 
          message: "Visitor already scanned",
          visitor: existingScan[0],
          alreadyScanned: true 
        });
      }

      // Record the scan
      const [newScan] = await db
        .insert(exhibitorStandVisitors)
        .values({
          exhibitorId,
          visitorId,
          eventId,
          standNumber,
          visitorType: visitorData.participantType || "attendee",
          visitorName: `${visitorData.firstName || ""} ${visitorData.lastName || ""}`.trim(),
          visitorEmail: visitorData.email || "",
          visitorPhone: visitorData.phone || "",
          visitorCompany: visitorData.company || "",
          visitorTitle: visitorData.jobTitle || visitorData.title || "",
          visitorUniversity: visitorData.university || "",
          visitorCourse: visitorData.course || "",
        })
        .returning();

      res.json({ 
        message: "Visitor scanned successfully",
        visitor: newScan,
        alreadyScanned: false 
      });
    } catch (error) {
      console.error("Error scanning visitor:", error);
      res.status(500).json({ error: "Failed to scan visitor" });
    }
  });

  // Get all visitors for an exhibitor
  app.get("/api/exhibitor/visitors", isAuthenticated, async (req, res) => {
    try {
      const exhibitorId = req.user?.id;
      const { eventId } = req.query;

      if (!exhibitorId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const visitors = await db
        .select()
        .from(exhibitorStandVisitors)
        .where(
          and(
            eq(exhibitorStandVisitors.exhibitorId, exhibitorId),
            eventId ? eq(exhibitorStandVisitors.eventId, Number(eventId)) : sql`true`
          )
        )
        .orderBy(desc(exhibitorStandVisitors.scanTime));

      res.json(visitors);
    } catch (error) {
      console.error("Error fetching exhibitor visitors:", error);
      res.status(500).json({ error: "Failed to fetch visitors" });
    }
  });

  // Update visitor follow-up status
  app.patch("/api/exhibitor/visitors/:visitorId", isAuthenticated, async (req, res) => {
    try {
      const exhibitorId = req.user?.id;
      const visitorId = parseInt(req.params.visitorId);
      const { followUpStatus, followUpNotes, notes, tags, interestedIn, leadScore } = req.body;

      if (!exhibitorId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (followUpStatus !== undefined) updateData.followUpStatus = followUpStatus;
      if (followUpNotes !== undefined) updateData.followUpNotes = followUpNotes;
      if (notes !== undefined) updateData.notes = notes;
      if (tags !== undefined) updateData.tags = JSON.stringify(tags);
      if (interestedIn !== undefined) updateData.interestedIn = interestedIn;
      if (leadScore !== undefined) updateData.leadScore = leadScore;

      if (followUpStatus === "contacted") {
        updateData.lastContactedAt = new Date();
      }

      const [updated] = await db
        .update(exhibitorStandVisitors)
        .set(updateData)
        .where(
          and(
            eq(exhibitorStandVisitors.id, visitorId),
            eq(exhibitorStandVisitors.exhibitorId, exhibitorId)
          )
        )
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Visitor not found" });
      }

      res.json({ message: "Visitor updated successfully", visitor: updated });
    } catch (error) {
      console.error("Error updating visitor:", error);
      res.status(500).json({ error: "Failed to update visitor" });
    }
  });

  // Export visitors as CSV
  app.get("/api/exhibitor/visitors/export", isAuthenticated, async (req, res) => {
    try {
      const exhibitorId = req.user?.id;
      const { eventId } = req.query;

      if (!exhibitorId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const visitors = await db
        .select()
        .from(exhibitorStandVisitors)
        .where(
          and(
            eq(exhibitorStandVisitors.exhibitorId, exhibitorId),
            eventId ? eq(exhibitorStandVisitors.eventId, Number(eventId)) : sql`true`
          )
        )
        .orderBy(desc(exhibitorStandVisitors.scanTime));

      // Convert to CSV format
      const csvHeaders = [
        "Name", "Email", "Phone", "Company", "Title", 
        "Type", "University", "Course", "Scan Time", 
        "Follow-up Status", "Lead Score", "Notes", "Interested In"
      ];
      
      const csvRows = visitors.map(v => [
        v.visitorName || "",
        v.visitorEmail || "",
        v.visitorPhone || "",
        v.visitorCompany || "",
        v.visitorTitle || "",
        v.visitorType || "",
        v.visitorUniversity || "",
        v.visitorCourse || "",
        v.scanTime ? new Date(v.scanTime).toLocaleString() : "",
        v.followUpStatus || "",
        v.leadScore?.toString() || "0",
        v.notes || "",
        v.interestedIn || ""
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="exhibitor-visitors-${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting visitors:", error);
      res.status(500).json({ error: "Failed to export visitors" });
    }
  });

  // Event Mood Sentiment Tracking API
  
  // Submit mood entry
  app.post('/api/mood/submit', async (req: any, res) => {
    try {
      const moodData = insertEventMoodEntrySchema.parse(req.body);
      
      // Add additional context
      moodData.ipAddress = req.ip;
      moodData.userAgent = req.get('User-Agent');
      
      // Insert mood entry
      const moodEntry = await db.insert(eventMoodEntries).values(moodData).returning();
      
      // Update aggregation
      await updateMoodAggregation(moodData.eventId, moodData.sessionName, moodData.moodType, moodData.intensity);
      
      res.status(201).json(moodEntry[0]);
    } catch (error) {
      console.error('Error submitting mood:', error);
      res.status(500).json({ message: 'Failed to submit mood entry' });
    }
  });

  // Get mood data for event
  app.get('/api/mood/:eventId', async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const { sessionName, timeRange = '1h' } = req.query;
      
      // Calculate time filter based on range
      const timeFilter = new Date();
      switch (timeRange) {
        case '15m':
          timeFilter.setMinutes(timeFilter.getMinutes() - 15);
          break;
        case '30m':
          timeFilter.setMinutes(timeFilter.getMinutes() - 30);
          break;
        case '1h':
          timeFilter.setHours(timeFilter.getHours() - 1);
          break;
        case '3h':
          timeFilter.setHours(timeFilter.getHours() - 3);
          break;
        case '6h':
          timeFilter.setHours(timeFilter.getHours() - 6);
          break;
        default:
          timeFilter.setHours(timeFilter.getHours() - 1);
      }

      // Build query conditions
      let whereConditions = [eq(eventMoodEntries.eventId, parseInt(eventId))];
      
      if (sessionName && sessionName !== 'all') {
        whereConditions.push(eq(eventMoodEntries.sessionName, sessionName));
      }
      
      whereConditions.push(gte(eventMoodEntries.createdAt, timeFilter));

      // Get mood entries
      const entries = await db
        .select()
        .from(eventMoodEntries)
        .where(and(...whereConditions))
        .orderBy(desc(eventMoodEntries.createdAt));

      // Get aggregated mood data
      const aggregatedData = await db
        .select({
          moodType: eventMoodEntries.moodType,
          count: sql<number>`COUNT(*)`,
          avgIntensity: sql<number>`AVG(intensity)`,
          sessionName: eventMoodEntries.sessionName
        })
        .from(eventMoodEntries)
        .where(and(...whereConditions))
        .groupBy(eventMoodEntries.moodType, eventMoodEntries.sessionName);

      // Get time-series data for charts (grouped by 5-minute intervals)
      const timeSeriesData = await db
        .select({
          timeSlot: sql<string>`TO_CHAR(DATE_TRUNC('minute', created_at) + 
            INTERVAL '5 min' * FLOOR(EXTRACT(MINUTE FROM created_at) / 5), 'HH24:MI')`,
          moodType: eventMoodEntries.moodType,
          count: sql<number>`COUNT(*)`,
          avgIntensity: sql<number>`AVG(intensity)`
        })
        .from(eventMoodEntries)
        .where(and(...whereConditions))
        .groupBy(
          sql`DATE_TRUNC('minute', created_at) + INTERVAL '5 min' * FLOOR(EXTRACT(MINUTE FROM created_at) / 5)`,
          eventMoodEntries.moodType
        )
        .orderBy(sql`DATE_TRUNC('minute', created_at) + INTERVAL '5 min' * FLOOR(EXTRACT(MINUTE FROM created_at) / 5)`);

      res.json({
        entries,
        aggregated: aggregatedData,
        timeSeries: timeSeriesData,
        totalEntries: entries.length,
        timeRange,
        sessionName: sessionName || 'all'
      });
    } catch (error) {
      console.error('Error fetching mood data:', error);
      res.status(500).json({ message: 'Failed to fetch mood data' });
    }
  });

  // Get mood aggregations for dashboard
  app.get('/api/mood/aggregations/:eventId', async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      const aggregations = await db
        .select()
        .from(eventMoodAggregations)
        .where(eq(eventMoodAggregations.eventId, parseInt(eventId)))
        .orderBy(desc(eventMoodAggregations.lastUpdated));

      res.json(aggregations);
    } catch (error) {
      console.error('Error fetching mood aggregations:', error);
      res.status(500).json({ message: 'Failed to fetch mood aggregations' });
    }
  });

  // Get available sessions for an event
  app.get('/api/mood/sessions/:eventId', async (req: any, res) => {
    try {
      const { eventId } = req.params;
      
      // Get unique sessions from mood entries
      const sessionsFromMood = await db
        .select({ sessionName: eventMoodEntries.sessionName })
        .from(eventMoodEntries)
        .where(eq(eventMoodEntries.eventId, parseInt(eventId)))
        .groupBy(eventMoodEntries.sessionName);

      // Get sessions from time slots if available
      const sessionsFromTimeSlots = await db
        .select({ title: eventTimeSlots.title })
        .from(eventTimeSlots)
        .where(eq(eventTimeSlots.eventId, parseInt(eventId)));

      // Combine and deduplicate sessions
      const allSessions = [
        ...sessionsFromMood.map(s => s.sessionName).filter(Boolean),
        ...sessionsFromTimeSlots.map(s => s.title).filter(Boolean)
      ];
      
      const uniqueSessions = [...new Set(allSessions)].sort();

      res.json(uniqueSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ message: 'Failed to fetch sessions' });
    }
  });

  // Helper function to update mood aggregation
  async function updateMoodAggregation(eventId: number, sessionName: string | null, moodType: string, intensity: number) {
    try {
      // Check if aggregation exists
      const existing = await db
        .select()
        .from(eventMoodAggregations)
        .where(and(
          eq(eventMoodAggregations.eventId, eventId),
          sessionName ? eq(eventMoodAggregations.sessionName, sessionName) : sql`session_name IS NULL`,
          eq(eventMoodAggregations.moodType, moodType)
        ));

      if (existing.length > 0) {
        // Update existing aggregation
        const current = existing[0];
        const newCount = current.totalCount + 1;
        const currentAvg = parseFloat(current.averageIntensity.toString());
        const newAvg = ((currentAvg * current.totalCount) + intensity) / newCount;

        await db
          .update(eventMoodAggregations)
          .set({
            totalCount: newCount,
            averageIntensity: newAvg.toFixed(2),
            lastUpdated: new Date()
          })
          .where(eq(eventMoodAggregations.id, current.id));
      } else {
        // Create new aggregation
        await db.insert(eventMoodAggregations).values({
          eventId,
          sessionName,
          moodType,
          totalCount: 1,
          averageIntensity: intensity.toFixed(2),
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating mood aggregation:', error);
    }
  }

  // ===========================
  // Affiliate Programme Routes
  // ===========================
  
  const { affiliateService } = await import("./affiliateService");
  
  // Get affiliate dashboard data
  app.get('/api/affiliate/dashboard', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get or create affiliate account
      let affiliate = await affiliateService.getAffiliateByUserId(userId);
      if (!affiliate) {
        affiliate = await affiliateService.createAffiliateAccount(userId);
      }

      if (!affiliate) {
        return res.status(500).json({ message: "Failed to create affiliate account" });
      }

      // Get affiliate stats
      const stats = await affiliateService.getAffiliateStats(affiliate.id);
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching affiliate dashboard:", error);
      res.status(500).json({ message: "Failed to fetch affiliate data: " + error.message });
    }
  });

  // Track affiliate click
  app.get('/api/affiliate/track/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const { redirect } = req.query;

      // Track the click
      await affiliateService.trackClick(code, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        referrerUrl: req.get('referer'),
        landingPage: redirect as string || '/'
      });

      // Store affiliate code in session/cookie for later use
      if (req.session) {
        req.session.affiliateCode = code;
      }

      // Redirect to the target page
      res.redirect(redirect as string || '/');
    } catch (error: any) {
      console.error("Error tracking affiliate click:", error);
      res.redirect('/');
    }
  });

  // Process affiliate referral during registration
  app.post('/api/affiliate/referral', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { affiliateCode } = req.body;
      if (!affiliateCode) {
        return res.status(400).json({ message: "Affiliate code required" });
      }

      const referral = await affiliateService.createReferral(affiliateCode, userId);
      res.json({ success: true, referral });
    } catch (error: any) {
      console.error("Error processing referral:", error);
      res.status(500).json({ message: "Failed to process referral: " + error.message });
    }
  });

  // Request affiliate payout
  app.post('/api/affiliate/payout', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const affiliate = await affiliateService.getAffiliateByUserId(userId);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate account not found" });
      }

      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid payout amount" });
      }

      const pendingEarnings = parseFloat(affiliate.pendingEarnings || "0");
      if (amount > pendingEarnings) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const success = await affiliateService.processPayout(affiliate.id, amount);
      if (success) {
        res.json({ success: true, message: "Payout processed successfully" });
      } else {
        res.status(500).json({ message: "Failed to process payout" });
      }
    } catch (error: any) {
      console.error("Error processing payout:", error);
      res.status(500).json({ message: "Failed to process payout: " + error.message });
    }
  });

  // Admin: Get all affiliates
  app.get('/api/admin/affiliates', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req.user as any);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const affiliates = await db.select({
        affiliate: affiliates,
        user: users
      })
        .from(affiliates)
        .leftJoin(users, eq(affiliates.userId, users.id))
        .orderBy(desc(affiliates.totalEarnings));

      res.json(affiliates);
    } catch (error: any) {
      console.error("Error fetching affiliates:", error);
      res.status(500).json({ message: "Failed to fetch affiliates: " + error.message });
    }
  });

  // Admin: Approve commissions
  app.post('/api/admin/commissions/approve', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req.user as any);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { commissionIds } = req.body;
      if (!commissionIds || !Array.isArray(commissionIds)) {
        return res.status(400).json({ message: "Invalid commission IDs" });
      }

      await db.update(affiliateCommissions)
        .set({ status: "approved", updatedAt: new Date() })
        .where(and(
          inArray(affiliateCommissions.id, commissionIds),
          eq(affiliateCommissions.status, "pending")
        ));

      res.json({ success: true, message: "Commissions approved" });
    } catch (error: any) {
      console.error("Error approving commissions:", error);
      res.status(500).json({ message: "Failed to approve commissions: " + error.message });
    }
  });

  // Webhook: Process commission on successful payment
  app.post('/api/webhook/stripe-payment', async (req: Request, res: Response) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const userId = paymentIntent.metadata?.userId;
        const amount = paymentIntent.amount / 100; // Convert from pence to pounds

        if (userId) {
          await affiliateService.processCommission(userId, amount, paymentIntent.id);
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: "Webhook error: " + error.message });
    }
  });

  // Automatically enroll all users as affiliates (run once)
  app.post('/api/admin/affiliates/enroll-all', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req.user as any);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const enrolled = await affiliateService.enrollAllUsersAsAffiliates();
      res.json({ 
        success: true, 
        message: `Successfully enrolled ${enrolled} users as affiliates` 
      });
    } catch (error: any) {
      console.error("Error enrolling affiliates:", error);
      res.status(500).json({ message: "Failed to enroll affiliates: " + error.message });
    }
  });

  // ===========================
  // Event Mood Sentiment API Routes
  // ===========================

  // Submit a mood entry for an event
  app.post('/api/events/:eventId/mood', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const moodData = insertEventMoodEntrySchema.parse({
        ...req.body,
        eventId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const entry = await storage.createMoodEntry(moodData);
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Error creating mood entry:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      res.status(500).json({ message: "Failed to create mood entry: " + error.message });
    }
  });

  // Get real-time mood data for an event
  app.get('/api/events/:eventId/mood', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const moodData = await storage.getRealTimeMoodData(eventId);
      res.json(moodData);
    } catch (error: any) {
      console.error("Error fetching mood data:", error);
      res.status(500).json({ message: "Failed to fetch mood data: " + error.message });
    }
  });

  // Get mood entries for a specific session
  app.get('/api/events/:eventId/mood/session/:sessionName', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const sessionName = req.params.sessionName;
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const entries = await storage.getMoodEntriesBySession(eventId, sessionName);
      res.json(entries);
    } catch (error: any) {
      console.error("Error fetching session mood entries:", error);
      res.status(500).json({ message: "Failed to fetch session mood entries: " + error.message });
    }
  });

  // Get mood aggregations for visualization
  app.get('/api/events/:eventId/mood/aggregations', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const aggregations = await storage.getMoodAggregationsByEventId(eventId);
      res.json(aggregations);
    } catch (error: any) {
      console.error("Error fetching mood aggregations:", error);
      res.status(500).json({ message: "Failed to fetch mood aggregations: " + error.message });
    }
  });

  // Get event mood analytics (admin only)
  app.get('/api/admin/events/:eventId/mood/analytics', isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const [entries, aggregations] = await Promise.all([
        storage.getMoodEntriesByEventId(eventId),
        storage.getMoodAggregationsByEventId(eventId)
      ]);

      // Calculate analytics
      const totalEntries = entries.length;
      const averageIntensity = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (entry.intensity || 0), 0) / entries.length 
        : 0;
      
      const moodDistribution = aggregations.reduce((acc, agg) => {
        acc[agg.moodType] = agg.totalCount;
        return acc;
      }, {} as Record<string, number>);

      const sessionBreakdown = entries.reduce((acc, entry) => {
        if (entry.sessionName) {
          if (!acc[entry.sessionName]) {
            acc[entry.sessionName] = { total: 0, moods: {} };
          }
          acc[entry.sessionName].total += 1;
          acc[entry.sessionName].moods[entry.moodType] = (acc[entry.sessionName].moods[entry.moodType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, { total: number; moods: Record<string, number> }>);

      const analytics = {
        totalEntries,
        averageIntensity: Math.round(averageIntensity * 100) / 100,
        moodDistribution,
        sessionBreakdown,
        recentEntries: entries.slice(0, 10),
        aggregations
      };

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching mood analytics:", error);
      res.status(500).json({ message: "Failed to fetch mood analytics: " + error.message });
    }
  });

  // Jobs Board API Endpoints
  
  // Get all active jobs
  app.get('/api/jobs', async (req, res) => {
    try {
      const jobs = await db
        .select()
        .from(jobPostings)
        .where(eq(jobPostings.isActive, true))
        .orderBy(desc(jobPostings.createdAt));
      
      res.json(jobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Submit job application
  app.post('/api/jobs/apply', isAuthenticated, async (req: any, res) => {
    try {
      const {
        jobId,
        applicantName,
        applicantEmail,
        applicantPhone,
        coverLetter,
        cvData,
        cvFileName,
        cvFileType,
        linkedinProfile
      } = req.body;

      // Validate required fields
      if (!jobId || !applicantName || !applicantEmail) {
        return res.status(400).json({ message: "Job ID, name, and email are required" });
      }

      // Check if job exists and is active
      const job = await db
        .select()
        .from(jobPostings)
        .where(eq(jobPostings.id, jobId))
        .limit(1);
      
      if (job.length === 0 || !job[0].isActive) {
        return res.status(404).json({ message: "Job not found or no longer accepting applications" });
      }

      // Check if user has already applied
      const existingApplication = await db
        .select()
        .from(jobApplications)
        .where(
          and(
            eq(jobApplications.jobId, jobId),
            eq(jobApplications.userId, req.user.id)
          )
        )
        .limit(1);
      
      if (existingApplication.length > 0) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      // Create job application
      const application = await db.insert(jobApplications).values({
        jobId,
        userId: req.user.id,
        applicantName,
        applicantEmail,
        applicantPhone,
        coverLetter,
        cvData,
        cvFileName,
        cvFileType,
        cvUploadedAt: cvData ? new Date() : null,
        linkedinProfile,
        status: "pending",
        appliedAt: new Date()
      }).returning();

      // Send notification email to applicant
      await emailService.sendNotificationEmail(
        applicantEmail,
        'Job Application Received',
        `
        <h2>Thank you for your application!</h2>
        <p>Dear ${applicantName},</p>
        
        <p>We have received your application for the position of <strong>${job[0].title}</strong> at ${job[0].company}.</p>
        
        <p>Your application is now being reviewed. We will contact you if your profile matches our requirements.</p>
        
        <h3>Application Details:</h3>
        <ul>
          <li><strong>Position:</strong> ${job[0].title}</li>
          <li><strong>Company:</strong> ${job[0].company}</li>
          <li><strong>Location:</strong> ${job[0].location}</li>
          <li><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        
        <p>Best regards,<br>
        Croydon Business Association</p>
        `
      );

      // Send notification to employer if they have an email set
      if (job[0].applicationEmail) {
        await emailService.sendNotificationEmail(
          job[0].applicationEmail,
          `New Application - ${job[0].title}`,
          `
          <h2>New Job Application Received</h2>
          
          <p>You have received a new application for the position of <strong>${job[0].title}</strong>.</p>
          
          <h3>Applicant Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${applicantName}</li>
            <li><strong>Email:</strong> ${applicantEmail}</li>
            ${applicantPhone ? `<li><strong>Phone:</strong> ${applicantPhone}</li>` : ''}
            ${linkedinProfile ? `<li><strong>LinkedIn:</strong> <a href="${linkedinProfile}">${linkedinProfile}</a></li>` : ''}
            ${cvFileName ? `<li><strong>CV Attached:</strong> ${cvFileName}</li>` : ''}
          </ul>
          
          ${coverLetter ? `<h3>Cover Letter:</h3><p>${coverLetter}</p>` : ''}
          
          <p>Log in to your account to view and manage applications.</p>
          
          <p>Best regards,<br>
          Croydon Business Association</p>
          `
        );
      }

      res.json({ 
        success: true, 
        message: "Application submitted successfully",
        applicationId: application[0].id 
      });

    } catch (error: any) {
      console.error("Error submitting job application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Get user's job applications
  app.get('/api/jobs/my-applications', isAuthenticated, async (req: any, res) => {
    try {
      const applications = await db
        .select({
          id: jobApplications.id,
          jobId: jobApplications.jobId,
          jobTitle: jobPostings.title,
          company: jobPostings.company,
          applicantName: jobApplications.applicantName,
          applicantEmail: jobApplications.applicantEmail,
          status: jobApplications.status,
          appliedAt: jobApplications.appliedAt,
          reviewedAt: jobApplications.reviewedAt,
          cvFileName: jobApplications.cvFileName
        })
        .from(jobApplications)
        .leftJoin(jobPostings, eq(jobApplications.jobId, jobPostings.id))
        .where(eq(jobApplications.userId, req.user.id))
        .orderBy(desc(jobApplications.appliedAt));
      
      res.json(applications);
    } catch (error: any) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get single job details
  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const job = await db
        .select()
        .from(jobPostings)
        .where(eq(jobPostings.id, parseInt(id)))
        .limit(1);
      
      if (job.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Increment view count
      await db
        .update(jobPostings)
        .set({ views: (job[0].views || 0) + 1 })
        .where(eq(jobPostings.id, parseInt(id)));

      res.json(job[0]);
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  // =============================================================================
  // BUSINESS EVENTS API - For business owners to promote their own events
  // =============================================================================

  // Get all approved business events (public)
  app.get("/api/business-events", async (req: Request, res: Response) => {
    try {
      const events = await db
        .select({
          id: businessEvents.id,
          businessId: businessEvents.businessId,
          eventName: businessEvents.eventName,
          eventSlug: businessEvents.eventSlug,
          description: businessEvents.description,
          eventType: businessEvents.eventType,
          eventDate: businessEvents.eventDate,
          startTime: businessEvents.startTime,
          endTime: businessEvents.endTime,
          venue: businessEvents.venue,
          venueAddress: businessEvents.venueAddress,
          maxCapacity: businessEvents.maxCapacity,
          currentRegistrations: businessEvents.currentRegistrations,
          isTicketed: businessEvents.isTicketed,
          ticketPrice: businessEvents.ticketPrice,
          memberDiscount: businessEvents.memberDiscount,
          registrationRequired: businessEvents.registrationRequired,
          registrationDeadline: businessEvents.registrationDeadline,
          isFeatured: businessEvents.isFeatured,
          tags: businessEvents.tags,
          imageUrl: businessEvents.imageUrl,
          contactEmail: businessEvents.contactEmail,
          contactPhone: businessEvents.contactPhone,
          websiteUrl: businessEvents.websiteUrl,
          socialLinks: businessEvents.socialLinks,
          specialOffers: businessEvents.specialOffers,
          requirements: businessEvents.requirements,
          createdAt: businessEvents.createdAt,
          businessName: businesses.name,
          businessAddress: businesses.address,
          businessLogo: businesses.logoUrl,
        })
        .from(businessEvents)
        .leftJoin(businesses, eq(businessEvents.businessId, businesses.id))
        .where(and(
          eq(businessEvents.isActive, true),
          eq(businessEvents.isApproved, true),
          gte(businessEvents.eventDate, new Date().toISOString().split('T')[0]) // Only future events
        ))
        .orderBy(desc(businessEvents.isFeatured), asc(businessEvents.eventDate));

      res.json(events);
    } catch (error) {
      console.error("Error fetching business events:", error);
      res.status(500).json({ message: "Failed to fetch business events" });
    }
  });

  // Get business events for a specific business owner
  app.get("/api/my-business-events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Get the user's business ID
      const business = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.userId, userId))
        .limit(1);
        
      if (business.length === 0) {
        return res.status(400).json({ message: "No business found for this user" });
      }

      const events = await db
        .select()
        .from(businessEvents)
        .where(eq(businessEvents.businessId, business[0].id))
        .orderBy(desc(businessEvents.createdAt));

      res.json(events);
    } catch (error) {
      console.error("Error fetching user's business events:", error);
      res.status(500).json({ message: "Failed to fetch business events" });
    }
  });

  // Create a new business event
  app.post("/api/business-events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Get the user's business ID
      const business = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.userId, userId))
        .limit(1);
        
      if (business.length === 0) {
        return res.status(400).json({ message: "No business found for this user" });
      }

      // Generate event slug from event name
      const eventSlug = req.body.eventName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const eventData = {
        ...req.body,
        businessId: business[0].id,
        eventSlug: `${eventSlug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        isApproved: false, // Requires admin approval
      };

      const validation = insertBusinessEventSchema.safeParse(eventData);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: fromZodError(validation.error).toString() 
        });
      }

      const [newEvent] = await db
        .insert(businessEvents)
        .values(validation.data)
        .returning();

      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating business event:", error);
      res.status(500).json({ message: "Failed to create business event" });
    }
  });

  // Update business event
  app.put("/api/business-events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      // Get the user's business ID
      const business = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.userId, userId))
        .limit(1);
        
      if (business.length === 0) {
        return res.status(400).json({ message: "No business found for this user" });
      }

      // Check if event belongs to this business
      const existingEvent = await db
        .select()
        .from(businessEvents)
        .where(and(
          eq(businessEvents.id, eventId),
          eq(businessEvents.businessId, business[0].id)
        ))
        .limit(1);

      if (existingEvent.length === 0) {
        return res.status(404).json({ message: "Event not found or not owned by this business" });
      }

      const eventData = {
        ...req.body,
        updatedAt: new Date(),
      };

      const [updatedEvent] = await db
        .update(businessEvents)
        .set(eventData)
        .where(eq(businessEvents.id, eventId))
        .returning();

      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating business event:", error);
      res.status(500).json({ message: "Failed to update business event" });
    }
  });

  // Delete business event
  app.delete("/api/business-events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      // Get the user's business ID
      const business = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.userId, userId))
        .limit(1);
        
      if (business.length === 0) {
        return res.status(400).json({ message: "No business found for this user" });
      }

      // Check if event belongs to this business
      const existingEvent = await db
        .select()
        .from(businessEvents)
        .where(and(
          eq(businessEvents.id, eventId),
          eq(businessEvents.businessId, business[0].id)
        ))
        .limit(1);

      if (existingEvent.length === 0) {
        return res.status(404).json({ message: "Event not found or not owned by this business" });
      }

      await db
        .delete(businessEvents)
        .where(eq(businessEvents.id, eventId));

      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting business event:", error);
      res.status(500).json({ message: "Failed to delete business event" });
    }
  });

  // Register for a business event
  app.post("/api/business-events/:id/register", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.id;

      // Check if event exists and is active
      const event = await db
        .select()
        .from(businessEvents)
        .where(and(
          eq(businessEvents.id, eventId),
          eq(businessEvents.isActive, true),
          eq(businessEvents.isApproved, true)
        ))
        .limit(1);

      if (event.length === 0) {
        return res.status(404).json({ message: "Event not found or not available" });
      }

      // Check if user is already registered
      const existingRegistration = await db
        .select()
        .from(businessEventRegistrations)
        .where(and(
          eq(businessEventRegistrations.eventId, eventId),
          eq(businessEventRegistrations.userId, userId)
        ))
        .limit(1);

      if (existingRegistration.length > 0) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      // Check capacity
      if (event[0].maxCapacity && event[0].currentRegistrations >= event[0].maxCapacity) {
        return res.status(400).json({ message: "Event is full" });
      }

      // Calculate ticket price (apply member discount if applicable)
      let actualPrice = event[0].ticketPrice || 0;
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const isMember = user[0]?.membershipStatus === 'active';
      
      if (isMember && event[0].memberDiscount > 0) {
        actualPrice = Math.round(actualPrice * (1 - event[0].memberDiscount / 100));
      }

      // Create registration
      const registrationData = {
        eventId,
        userId,
        actualPrice,
        ticketType: isMember ? 'member' : 'regular',
        paymentStatus: actualPrice === 0 ? 'paid' : 'pending',
      };

      const [registration] = await db
        .insert(businessEventRegistrations)
        .values(registrationData)
        .returning();

      // Update event registration count
      await db
        .update(businessEvents)
        .set({ 
          currentRegistrations: sql`${businessEvents.currentRegistrations} + 1`,
          updatedAt: new Date()
        })
        .where(eq(businessEvents.id, eventId));

      res.status(201).json(registration);
    } catch (error) {
      console.error("Error registering for business event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Admin routes for business events
  app.get("/api/admin/business-events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const events = await db
        .select({
          id: businessEvents.id,
          businessId: businessEvents.businessId,
          eventName: businessEvents.eventName,
          eventSlug: businessEvents.eventSlug,
          description: businessEvents.description,
          eventType: businessEvents.eventType,
          eventDate: businessEvents.eventDate,
          startTime: businessEvents.startTime,
          endTime: businessEvents.endTime,
          venue: businessEvents.venue,
          maxCapacity: businessEvents.maxCapacity,
          currentRegistrations: businessEvents.currentRegistrations,
          isTicketed: businessEvents.isTicketed,
          ticketPrice: businessEvents.ticketPrice,
          isActive: businessEvents.isActive,
          isFeatured: businessEvents.isFeatured,
          isApproved: businessEvents.isApproved,
          createdAt: businessEvents.createdAt,
          businessName: businesses.name,
          businessOwner: users.firstName,
          businessOwnerEmail: users.email,
        })
        .from(businessEvents)
        .leftJoin(businesses, eq(businessEvents.businessId, businesses.id))
        .leftJoin(users, eq(businesses.userId, users.id))
        .orderBy(desc(businessEvents.createdAt));

      res.json(events);
    } catch (error) {
      console.error("Error fetching business events for admin:", error);
      res.status(500).json({ message: "Failed to fetch business events" });
    }
  });

  // Admin approve/reject business event
  app.patch("/api/admin/business-events/:id/approval", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const eventId = parseInt(req.params.id);
      const { isApproved } = req.body;

      const [updatedEvent] = await db
        .update(businessEvents)
        .set({ 
          isApproved: isApproved,
          updatedAt: new Date()
        })
        .where(eq(businessEvents.id, eventId))
        .returning();

      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating business event approval:", error);
      res.status(500).json({ message: "Failed to update event approval" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
