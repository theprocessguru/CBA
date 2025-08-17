import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { emailService } from "./emailService";
import type { Express, Request, Response, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  // Ensure SESSION_SECRET is available
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && process.env.REPLIT_DOMAINS, // Enable secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site cookies in production
      maxAge: sessionTtl,
    },
  });
}

export async function setupLocalAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
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
        profileImageUrl: null,
        passwordHash: hashedPassword,
      });

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

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
          emailNotVerified: true 
        });
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

      // Explicitly save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        
        res.json({ 
          success: true, 
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

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

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
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  
  if (!session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Fetch fresh user data from database to ensure we have current admin status
  const user = await storage.getUser(session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach full user data including isAdmin flag
  req.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin || false
  };
  next();
};