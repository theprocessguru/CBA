import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated } from "./localAuth";
import multer from "multer";
import * as Papa from "papaparse";
import { insertBusinessSchema, insertProductSchema, insertOfferSchema, insertCategorySchema, insertContentReportSchema, insertInteractionSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { getGHLService } from "./ghlService";
import { emailService } from "./emailService";
import { aiService } from "./aiService";
import { aiAdvancedService } from "./aiAdvancedService";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Setup multer for file uploads
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
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const user = await storage.getUser(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: "Forbidden: Admin access required" });
    
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
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
  
  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many auth attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/auth', authLimiter);
  app.use('/api', limiter);
  
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
  
  // Get public offers (excludes member-only offers)
  app.get('/api/offers', async (req, res) => {
    try {
      const { limit } = req.query;
      const options = {
        limit: limit ? parseInt(limit as string) : undefined,
        includePublic: true
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
      if (!req.user.isAdmin) {
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

  app.put('/api/admin/members/:userId/membership', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

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
  app.post('/api/my/business', isAuthenticated, async (req: any, res) => {
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
        
        // Auto-sync new member to GHL
        const ghlService = getGHLService();
        if (ghlService) {
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
              
              await ghlService.syncBusinessMember(memberData);
              console.log(`New member ${user.email} synced to GHL successfully`);
            }
          } catch (ghlError) {
            console.error("Failed to sync new member to GHL:", ghlError);
            // Don't fail the business creation if GHL sync fails
          }
        }
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error creating/updating business:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create/update business" });
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
  app.post('/api/my/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const business = await storage.getBusinessByUserId(userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const productData = validateRequest(insertProductSchema, { ...req.body, businessId: business.id });
      const product = await storage.createProduct(productData);
      
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create product" });
    }
  });
  
  // Update product
  app.put('/api/my/products/:id', isAuthenticated, async (req: any, res) => {
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
  app.delete('/api/my/products/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/my/offers', isAuthenticated, async (req: any, res) => {
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
  app.put('/api/my/offers/:id', isAuthenticated, async (req: any, res) => {
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
  app.delete('/api/my/offers/:id', isAuthenticated, async (req: any, res) => {
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
  
  // GHL Integration routes
  
  // Test GHL connection
  app.get('/api/ghl/test', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const ghlService = getGHLService();
      if (!ghlService) {
        return res.status(503).json({ message: "Go High Level integration not configured" });
      }
      
      const isConnected = await ghlService.testConnection();
      res.json({ 
        connected: isConnected,
        message: isConnected ? "GHL connection successful" : "GHL connection failed"
      });
    } catch (error) {
      console.error("Error testing GHL connection:", error);
      res.status(500).json({ message: "Failed to test GHL connection" });
    }
  });
  
  // Sync member to GHL
  app.post('/api/ghl/sync-member', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const ghlService = getGHLService();
      if (!ghlService) {
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
      
      const ghlContact = await ghlService.syncBusinessMember(memberData);
      res.json({ 
        success: true, 
        ghlContactId: ghlContact.id,
        message: "Member synced to Go High Level successfully"
      });
    } catch (error) {
      console.error("Error syncing member to GHL:", error);
      res.status(500).json({ message: "Failed to sync member to GHL" });
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
          userId: req.user?.id || 'anonymous',
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
        agreesToTerms
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

      // Store registration in database
      const registration = await storage.createAISummitExhibitorRegistration({
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
        numberOfAttendees: numberOfAttendees || 2,
        previousExhibitor: previousExhibitor || false,
        referralSource: referralSource || null,
        agreesToTerms: agreesToTerms,
        registeredAt: new Date()
      });

      // Sync with GHL (Go High Level)
      try {
        const ghlService = getGHLService();
        if (ghlService) {
          // Split contact name into first and last name
          const nameParts = contactName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Prepare GHL contact data
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

          // Create or update contact in GHL
          const ghlContact = await ghlService.upsertContact(ghlContactData);
          console.log(`AI Summit exhibitor registration synced to GHL: Contact ID ${ghlContact.id}`);
        }
      } catch (ghlError) {
        console.error("Failed to sync AI Summit exhibitor registration to GHL:", ghlError);
        // Don't fail the registration if GHL sync fails
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

      res.json({ 
        success: true, 
        message: "Exhibitor registration successful! We'll contact you within 2 business days with booth details.",
        registrationId: registration.id
      });

    } catch (error: any) {
      console.error("AI Summit exhibitor registration error:", error);
      res.status(500).json({ 
        message: "Exhibitor registration failed. Please try again or contact support." 
      });
    }
  });

  // AI Summit Registration endpoint
  app.post("/api/ai-summit-registration", async (req, res) => {
    try {
      const { 
        name, 
        email, 
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

      // Store registration in database
      const registration = await storage.createAISummitRegistration({
        name,
        email,
        company: company || null,
        jobTitle: jobTitle || null,
        phoneNumber: phoneNumber || null,
        businessType: businessType || null,
        aiInterest: aiInterest || null,
        accessibilityNeeds: accessibilityNeeds || null,
        comments: comments || null,
        registeredAt: new Date()
      });

      // Sync with GHL (Go High Level)
      try {
        const ghlService = getGHLService();
        if (ghlService) {
          // Split name into first and last name
          const nameParts = name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Prepare GHL contact data
          const ghlContactData = {
            email,
            firstName,
            lastName,
            phone: phoneNumber,
            companyName: company,
            tags: [
              'AI_Summit_2025',
              'Event_Registration',
              ...(businessType ? [`Business_Type_${businessType.replace(/[^a-zA-Z0-9]/g, '_')}`] : []),
              ...(aiInterest ? [`AI_Interest_${aiInterest.replace(/[^a-zA-Z0-9]/g, '_')}`] : [])
            ],
            customFields: {
              job_title: jobTitle,
              business_type: businessType,
              ai_interest: aiInterest,
              accessibility_needs: accessibilityNeeds,
              registration_comments: comments,
              event_name: 'First AI Summit Croydon 2025',
              event_date: 'October 1st, 2025',
              registration_date: new Date().toISOString()
            }
          };

          // Create or update contact in GHL
          const ghlContact = await ghlService.upsertContact(ghlContactData);
          console.log(`AI Summit registration synced to GHL: Contact ID ${ghlContact.id}`);
        }
      } catch (ghlError) {
        console.error("Failed to sync AI Summit registration to GHL:", ghlError);
        // Don't fail the registration if GHL sync fails
      }

      // Send confirmation email if email service is available
      try {
        if (emailService) {
          await emailService.sendEmail({
            to: email,
            subject: "AI Summit 2025 Registration Confirmed",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Registration Confirmed!</h1>
                <p>Dear ${name},</p>
                <p>Thank you for registering for the <strong>First AI Summit Croydon 2025</strong>!</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1f2937; margin-top: 0;">Event Details</h2>
                  <p><strong>Date:</strong> October 1st, 2025</p>
                  <p><strong>Time:</strong> 10:00 AM - 4:00 PM</p>
                  <p><strong>Venue:</strong> LSBU London South Bank University Croydon</p>
                  <p><strong>Admission:</strong> FREE</p>
                </div>

                <p>We're excited to have you join us for this groundbreaking event featuring:</p>
                <ul>
                  <li>Keynote speakers from leading AI companies</li>
                  <li>Hands-on AI workshops</li>
                  <li>Micro business exhibition</li>
                  <li>Networking opportunities</li>
                  <li>Free refreshments throughout the day</li>
                </ul>

                <p>You'll receive more details about the agenda and speakers closer to the event date.</p>

                <p>If you have any questions, please don't hesitate to contact us.</p>

                <p>Best regards,<br>
                <strong>The Croydon Business Association Team</strong></p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the registration if email fails
      }

      res.json({ 
        success: true, 
        message: "Registration successful! You'll receive a confirmation email shortly.",
        registrationId: registration.id
      });

    } catch (error: any) {
      console.error("AI Summit registration error:", error);
      res.status(500).json({ 
        message: "Registration failed. Please try again or contact support." 
      });
    }
  });

  // AI Summit Speaker Interest endpoint
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
        talkTitle,
        talkDescription,
        talkDuration,
        audienceLevel,
        speakingExperience,
        previousSpeaking,
        techRequirements,
        motivationToSpeak,
        keyTakeaways,
        interactiveElements,
        handoutsProvided,
        agreesToTerms
      } = req.body;

      // Basic validation
      if (!name || !email || !bio || !talkTitle || !talkDescription || !keyTakeaways) {
        return res.status(400).json({ message: "Name, email, bio, talk title, description, and key takeaways are required" });
      }

      if (!agreesToTerms) {
        return res.status(400).json({ message: "Must agree to speaker terms and conditions" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      // Add speaker to GoHighLevel if available
      const ghlService = getGHLService();
      if (ghlService) {
        try {
          await ghlService.addContact({
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
          console.error('GHL sync failed for speaker:', ghlError);
          // Continue with registration even if GHL sync fails
        }
      }

      // Send confirmation email
      const emailService = getEmailService();
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

      res.json({ 
        success: true, 
        message: "Speaker interest submitted successfully! Our program committee will review your proposal and contact you soon."
      });

    } catch (error: any) {
      console.error("AI Summit speaker interest error:", error);
      res.status(500).json({ 
        message: "Speaker interest submission failed. Please try again or contact support." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
