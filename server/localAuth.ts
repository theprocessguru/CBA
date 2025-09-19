import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { emailService } from "./emailService";
import type { Express, Request, Response, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { organizationMemberships, insertOrganizationMembershipSchema } from "@shared/schema";
import { db } from "./db";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
    // Add error handling for database connection issues
    errorLog: (error: any) => {
      console.error('Session store error:', error);
    }
  });
  // Ensure SESSION_SECRET is available
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  
  // Check if we're running on Replit - cookies need special handling in preview
  const isReplit = process.env.REPLIT_DOMAINS ? true : false;
  
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: true, // Force session save
    saveUninitialized: true, // Create sessions immediately
    rolling: true, // Reset expiry on activity
    name: 'cba.sid', // Custom name to avoid conflicts
    cookie: {
      httpOnly: true,
      secure: false, // False for HTTP
      sameSite: 'lax', // Lax for same-site
      maxAge: sessionTtl,
      path: '/',
    },
    proxy: true, // Always trust proxy in Replit
  });
  
  // Return the session middleware directly
  return sessionMiddleware;
}

export async function setupLocalAuth(app: Express) {
  // Trust proxy for Replit environment - MUST be before session
  app.set("trust proxy", 1);
  
  // Session middleware MUST come before CORS
  app.use(getSession());
  
  // Add CORS headers after session for cookie support
  app.use((req, res, next) => {
    // For Replit preview, we need specific CORS handling
    const origin = req.headers.origin || req.headers.referer || '*';
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', origin === '*' ? '*' : origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Session-Token');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone, 
        homeAddress,
        homeCity,
        homePostcode,
        businessAddress,
        businessCity,
        businessPostcode,
        businessName,
        businessDescription,
        businessWebsite,
        businessPhone,
        businessEmail,
        businessCategory,
        employeeCount,
        established,
        organizationMemberships: orgMemberships = [],
        personTypeIds = [] 
      } = req.body;

      if (!email || !password || !firstName || !lastName || !phone || !homeAddress || !homeCity || !homePostcode) {
        return res.status(400).json({ message: "Email, password, first name, last name, phone number, and home address are required" });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.upsertUser({
        id: Date.now().toString(), // Simple ID generation
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        homeAddress: homeAddress || null,
        homeCity: homeCity || null,
        homePostcode: homePostcode || null,
        homeCountry: "UK",
        businessAddress: businessAddress || null,
        businessCity: businessCity || null,
        businessPostcode: businessPostcode || null,
        businessCountry: businessAddress ? "UK" : null,
        profileImageUrl: null,
        passwordHash: hashedPassword,
      });

      // Assign person types to new user
      if (personTypeIds && personTypeIds.length > 0) {
        for (const personTypeId of personTypeIds) {
          try {
            await storage.assignPersonTypeToUser({ 
              userId: user.id, 
              personTypeId: personTypeId, 
              isPrimary: false 
            });
          } catch (error) {
            console.warn(`Failed to assign person type ${personTypeId} to user ${user.id}:`, error);
          }
        }
      } else {
        // Default to attendee if no person types selected (person type ID 1 is attendee)
        try {
          await storage.assignPersonTypeToUser({ 
            userId: user.id, 
            personTypeId: 1, // Attendee person type ID
            isPrimary: true 
          });
        } catch (error) {
          console.warn(`Failed to assign default attendee type to user ${user.id}:`, error);
        }
      }

      // Save organization memberships if provided
      if (orgMemberships && orgMemberships.length > 0) {
        for (const orgMembership of orgMemberships) {
          if (orgMembership.organizationName && orgMembership.organizationType && orgMembership.role) {
            try {
              await db.insert(organizationMemberships).values({
                userId: user.id,
                organizationName: orgMembership.organizationName,
                organizationType: orgMembership.organizationType,
                role: orgMembership.role,
                isActive: orgMembership.isActive !== false,
                description: orgMembership.description || null,
                contactEmail: orgMembership.contactEmail || null,
                contactPhone: orgMembership.contactPhone || null,
                websiteUrl: orgMembership.websiteUrl || null,
              });
            } catch (error) {
              console.warn(`Failed to save organization membership for user ${user.id}:`, error);
            }
          }
        }
      }

      // Auto-verify all new users (verification disabled)
      try {
        await storage.updateUser(user.id, { emailVerified: true });
        console.log(`User ${email} auto-verified (verification disabled)`);
      } catch (verificationError) {
        console.error("Failed to auto-verify user:", verificationError);
      }

      // Send welcome email to new user
      try {
        if (emailService) {
          // Determine participant type for welcome email
          let welcomeParticipantType = 'attendee'; // default
          if (personTypeIds && personTypeIds.length > 0) {
            // Map person type IDs to participant types (you may need to adjust these mappings)
            const typeMapping: Record<number, string> = {
              1: 'attendee',
              2: 'volunteer', 
              3: 'vip',
              4: 'speaker',
              5: 'exhibitor',
              6: 'sponsor',
              7: 'team',
              8: 'student'
            };
            welcomeParticipantType = typeMapping[personTypeIds[0]] || 'attendee';
          }
          
          // Send welcome email to user
          const welcomeResult = await emailService.sendWelcomeEmail(
            email,
            `${firstName} ${lastName}`,
            welcomeParticipantType
          );
          
          if (welcomeResult.success) {
            console.log(`Welcome email sent to ${email}`);
          } else {
            console.error(`Failed to send welcome email to ${email}:`, welcomeResult.message);
          }
        }
      } catch (welcomeError) {
        console.error("Failed to send welcome email:", welcomeError);
        // Don't fail the registration if welcome email fails
      }

      // Send registration notification to admin
      try {
        if (emailService) {
          const additionalDetails = {
            company: businessName || 'Not provided',
            phone: phone,
            homeAddress: `${homeAddress}, ${homeCity}, ${homePostcode}`,
            personTypes: personTypeIds.length > 0 ? personTypeIds.join(', ') : 'Standard user'
          };
          
          await emailService.sendRegistrationNotification(
            `${firstName} ${lastName}`,
            email,
            'User Account',
            additionalDetails
          );
        }
      } catch (notificationError) {
        console.error("Failed to send registration notification:", notificationError);
        // Don't fail the registration if notification fails
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin || false,
      };

      res.json({ 
        success: true, 
        message: "Registration successful! Please check your email to verify your account.",
        requiresVerification: !user.emailVerified,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin || false,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Email verification is now disabled - auto-verify if not already verified
      if (!user.emailVerified) {
        await storage.updateUser(user.id, { emailVerified: true });
        console.log(`Auto-verified user ${user.email} during login`);
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin || false,
      };

      // Generate auth token for Replit environment
      const authToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days
      
      // Store token
      authTokens.set(authToken, {
        userId: user.id,
        expiresAt
      });
      
      // Explicitly save the session (for non-Replit environments)
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        
        console.log("Login successful - Session saved for user:", user.email);
        console.log("Session ID after save:", req.sessionID);
        console.log("Session data after save:", req.session);
        
        res.json({ 
          success: true,
          sessionId: req.sessionID, // Include session ID for debugging
          authToken, // Include auth token for Replit environment
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin || false,
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Logout endpoint - both GET and POST for compatibility
  const handleLogout = (req: Request, res: Response) => {
    console.log("Logout request received:", req.method, req.path);
    console.log("Current session ID:", req.sessionID);
    
    const sessionId = req.sessionID;
    
    // Add session to blacklist immediately - this ensures logout works even if session store fails
    if (sessionId) {
      loggedOutSessions.add(sessionId);
      console.log("Added session to blacklist:", sessionId);
    }
    
    // Clear auth token if provided
    const authToken = req.headers['authorization']?.replace('Bearer ', '');
    if (authToken) {
      console.log("Clearing auth token:", authToken.slice(0, 10) + "...");
      authTokens.delete(authToken);
    }
    
    // Clear all auth tokens for this session if we have a userId
    const session = req.session as any;
    if (session?.userId) {
      const userId = session.userId;
      console.log("Clearing all auth tokens for user:", userId);
      // Remove all tokens for this user
      Array.from(authTokens.entries()).forEach(([token, data]) => {
        if (data.userId === userId) {
          authTokens.delete(token);
          console.log("Deleted token for user:", userId);
        }
      });
    }
    
    // Clear cookies immediately
    res.clearCookie('cba.sid', { path: '/', domain: undefined });
    res.clearCookie('connect.sid', { path: '/', domain: undefined });
    res.clearCookie('session', { path: '/', domain: undefined });
    
    console.log("Logout completed - blacklisted session and cleared cookies");
    
    // Redirect for GET requests, JSON response for POST
    if (req.method === 'GET') {
      res.redirect('/');
    } else {
      res.json({ success: true, message: "Logged out successfully" });
    }
  };
  
  app.post('/api/auth/logout', handleLogout);
  app.get('/api/logout', handleLogout);

  // Forgot password endpoint
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return success even if user doesn't exist for security
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Save token to database
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send password reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        email, 
        token, 
        user.firstName || undefined
      );

      // Helper function to get the proper base URL
      const getBaseUrl = () => {
        if (process.env.BASE_URL) {
          return process.env.BASE_URL;
        }
        if (process.env.REPLIT_DOMAINS) {
          const domain = process.env.REPLIT_DOMAINS.split(',')[0];
          return `https://${domain}`;
        }
        return 'http://localhost:5000';
      };

      res.json({ 
        message: "If an account with that email exists, a password reset link has been sent.",
        emailSent,
        // For development/testing only - remove in production
        ...(process.env.NODE_ENV === 'development' && {
          resetUrl: `${getBaseUrl()}/reset-password?token=${token}`
        })
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Reset password endpoint
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Verify token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Update user password
      await storage.updateUser(resetToken.userId, { passwordHash });

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(resetToken.id);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Validate reset token endpoint
  app.get('/api/auth/validate-reset-token/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ valid: false, message: "Invalid or expired reset token" });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Validate token error:", error);
      res.status(500).json({ valid: false, message: "Failed to validate token" });
    }
  });


}

// Simple in-memory token store for Replit environment
const authTokens = new Map<string, { userId: string; expiresAt: Date }>();

// In-memory impersonation store for Replit environment
export const impersonationData = new Map<string, {
  impersonatedUserId: string;
  originalAdmin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
  };
}>();

// Blacklist for logged out sessions - this ensures logout works even if session store fails
const loggedOutSessions = new Set<string>();

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check if session is blacklisted (logged out)
  const sessionId = req.sessionID;
  if (sessionId && loggedOutSessions.has(sessionId)) {
    console.log("Session is blacklisted (logged out):", sessionId);
    return res.status(401).json({ message: "Unauthorized" });
  }

  // First check for auth token in header (for Replit environment)
  const authToken = req.headers['authorization']?.replace('Bearer ', '');
  
  if (authToken) {
    const tokenData = authTokens.get(authToken);
    if (tokenData && tokenData.expiresAt > new Date()) {
      // Check if this token has impersonation data
      const impersonation = impersonationData.get(authToken);
      if (impersonation) {
        // We're impersonating - use impersonated user instead of token user
        const impersonatedUser = await storage.getUser(impersonation.impersonatedUserId);
        if (impersonatedUser) {
          req.user = {
            ...impersonatedUser,
            isImpersonating: true,
            originalAdmin: impersonation.originalAdmin
          };
          console.log("Authenticated via token but impersonating:", impersonatedUser.email);
          return next();
        }
      }
      
      // Normal token auth - no impersonation
      const user = await storage.getUser(tokenData.userId);
      if (user) {
        req.user = user; // Use the full user object
        console.log("Authenticated via token:", user.id, user.email);
        return next();
      }
    }
  }
  
  // Fall back to session-based auth
  const session = req.session as any;
  
  if (!session?.userId) {
    console.log("No session userId found");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if session has impersonation data
  if (session.impersonating && session.impersonatedUserId) {
    // We're impersonating - use impersonated user instead of session user
    const impersonatedUser = await storage.getUser(session.impersonatedUserId);
    if (impersonatedUser) {
      req.user = {
        ...impersonatedUser,
        isImpersonating: true,
        originalAdmin: session.originalAdmin
      };
      console.log("Authenticated via session but impersonating:", impersonatedUser.email);
      return next();
    }
  }

  // Fetch fresh user data from database to ensure we have current admin status
  const user = await storage.getUser(session.userId);
  if (!user) {
    console.log("User not found for session userId:", session.userId);
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Normal session auth - no impersonation
  req.user = user;
  console.log("Authenticated via session:", user.id, user.email);
  next();
};