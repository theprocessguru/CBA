import nodemailer from 'nodemailer';
import { db } from './db';
import { emailCommunications, emailTemplates, type InsertEmailCommunication } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeFromEnv();
  }

  private getBaseUrl(): string {
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    }
    // Always use production domain for email links
    return 'https://members.croydonba.org.uk';
  }

  private initializeFromEnv() {
    // Force Gmail SMTP configuration - ignore old environment variables
    let host = 'smtp.gmail.com';
    let port = '587';
    let user = 'members.app.croydonba@gmail.com';
    let password = process.env.SMTP_PASSWORD; // This is the new app password
    let fromEmail = 'members.app.croydonba@gmail.com';
    let fromName = 'Croydon Business Association';

    if (password) {
      console.log(`Email service initialized with Gmail SMTP`);
      console.log(`Using Gmail account: ${user}`);
      this.config = {
        host,
        port: parseInt(port),
        secure: false, // Use STARTTLS for Gmail
        user,
        password,
        fromEmail,
        fromName,
      };
      this.createTransporter();
    } else {
      console.warn('Email service not properly configured - SMTP_PASSWORD not set');
    }
  }

  private createTransporter() {
    if (!this.config) return;

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.password,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds  
      debug: true,
      logger: false
    });
  }

  public configure(config: EmailConfig) {
    this.config = config;
    this.createTransporter();
  }

  public isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }

  /**
   * Get admin email for BCC notifications
   */
  private getAdminEmail(): string {
    return process.env.ADMIN_BCC_EMAIL || 'steven.ball@me.com';
  }

  /**
   * Send registration notification to admin
   */
  async sendRegistrationNotification(
    userName: string,
    userEmail: string,
    registrationType: string,
    additionalDetails?: any
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    try {
      const subject = `🎉 New ${registrationType} Registration - ${userName}`;
      
      const detailsHtml = additionalDetails ? 
        Object.entries(additionalDetails)
          .map(([key, value]) => `<tr><td style="padding: 5px; font-weight: bold; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').trim()}:</td><td style="padding: 5px;">${value}</td></tr>`)
          .join('') : '';

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Registration Alert</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${registrationType} Registration</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">📋 Registration Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Name:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userName}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userEmail}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Type:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registrationType}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Registration Time:</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td></tr>
              ${detailsHtml}
            </table>
            
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c4a6e;">
                <strong>💡 Next Steps:</strong> Review the registration and follow up as needed. The user will receive a verification email to confirm their account.
              </p>
            </div>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: this.getAdminEmail(),
        subject: subject,
        html: htmlContent,
      };

      await this.transporter!.sendMail(mailOptions);
      
      // Log the notification email
      await this.logEmail(null, this.getAdminEmail(), subject, htmlContent, 'admin_notification', 'sent', {
        registrationType,
        userEmail,
        userName
      });
      
      return {
        success: true,
        message: 'Registration notification sent to admin'
      };
    } catch (error: any) {
      console.error('Error sending registration notification:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to send registration notification'
      };
    }
  }

  /**
   * Log email to the database for tracking
   */
  private async logEmail(
    userId: string | null,
    recipientEmail: string,
    subject: string,
    content: string,
    emailType: string,
    status: 'sent' | 'failed' = 'sent',
    metadata?: any
  ): Promise<void> {
    try {
      // If no userId provided, try to find user by email
      if (!userId) {
        const { users } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, recipientEmail))
          .limit(1);
        
        if (user) {
          userId = user.id;
        }
      }

      // Only log if we have a userId
      if (userId) {
        const emailLog: InsertEmailCommunication = {
          userId,
          subject,
          content,
          emailType,
          status,
          metadata: metadata || {}
        };

        await db.insert(emailCommunications).values(emailLog);
        console.log(`Email logged: ${emailType} to ${recipientEmail}`);
      }
    } catch (error) {
      console.error('Error logging email:', error);
      // Don't throw - we don't want email logging failures to prevent email sending
    }
  }

  /**
   * Send a general email
   */
  async sendEmail(
    recipientEmail: string,
    subject: string,
    htmlContent: string,
    emailType: string = 'general',
    userId?: string
  ): Promise<void> {
    if (!this.isConfigured()) {
      await this.logEmail(userId || null, recipientEmail, subject, htmlContent, emailType, 'failed', { error: 'Email service not configured' });
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: recipientEmail,
        bcc: this.getAdminEmail(), // BCC admin on all emails
        subject: subject,
        html: htmlContent,
      };

      await this.transporter!.sendMail(mailOptions);
      await this.logEmail(userId || null, recipientEmail, subject, htmlContent, emailType, 'sent');
    } catch (error) {
      await this.logEmail(userId || null, recipientEmail, subject, htmlContent, emailType, 'failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    recipientEmail: string,
    recipientName: string,
    verificationToken: string,
    participantType: string = 'attendee'
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Email service not configured. Please contact IT support.'
      };
    }

    const baseUrl = this.getBaseUrl();
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

    // Define content based on participant type
    const participantContent: Record<string, {greeting: string, message: string, benefits: string[]}> = {
      attendee: {
        greeting: "Welcome to the Croydon Business Association!",
        message: "Thank you for registering for the AI Summit 2025! Your registration is confirmed for October 1st, 2025 (10 AM-4 PM) at LSBU London South Bank University Croydon. IMPORTANT: You need to set up your QR code for event entry - this is your key to getting into the summit.",
        benefits: [
          "🔑 SET UP YOUR QR CODE: Log into your account and download your event badge", 
          "📱 Print your badge or save the QR code on your phone for scanning at entry",
          "📧 Watch for your badge email with printing instructions", 
          "🎯 Present QR code at entrance on October 1st for instant access"
        ]
      },
      vip: {
        greeting: "Welcome to our VIP Community!",
        message: "We're honored to have you as a VIP for the AI Summit 2025! Your registration includes exclusive VIP access on October 1st, 2025 at LSBU. CRITICAL: You must set up your QR code for VIP entry - this unlocks your premium access.",
        benefits: [
          "🔑 SET UP YOUR VIP QR CODE: Log in to download your special VIP badge",
          "👑 VIP lounge access and priority seating at the AI Summit", 
          "📱 Present your VIP QR code at entrance for instant premium access",
          "🎯 Watch for your VIP badge email with exclusive entry instructions"
        ]
      },
      volunteer: {
        greeting: "Welcome to our Volunteer Team!",
        message: "Thank you for volunteering at the AI Summit 2025! You're essential to making October 1st successful at LSBU. IMPORTANT: Set up your volunteer QR code immediately - this gives you early access and identifies you to coordinators.",
        benefits: [
          "🔑 SET UP VOLUNTEER QR CODE: Download your official volunteer badge now",
          "⏰ Early entry access before 10 AM for setup duties", 
          "📱 Your QR code identifies you to event coordinators instantly",
          "🎯 Check email for volunteer schedule and badge printing instructions"
        ]
      },
      team: {
        greeting: "Welcome to the CBA Team!",
        message: "Welcome aboard! As a team member, you're at the heart of the Croydon Business Association. Verify your email to access internal tools, team resources, and your official staff credentials.",
        benefits: ["Admin dashboard access", "Event management tools", "Team communication channels", "Staff identification badge"]
      },
      speaker: {
        greeting: "Welcome, Distinguished Speaker!",
        message: "We're thrilled to have you as a speaker at our events. Verification gives you access to speaker resources, session management tools, and your speaker badge with special privileges.",
        benefits: ["Speaker green room access", "Presentation upload portal", "Session scheduling tools", "Professional networking opportunities"]
      },
      exhibitor: {
        greeting: "Welcome to our Exhibition Network!",
        message: "Thank you for joining as an exhibitor. Once verified, you can manage your exhibition space, access exhibitor resources, and receive your exhibitor credentials for setup and access.",
        benefits: ["Exhibition space management", "Setup and breakdown schedules", "Lead capture tools", "Exhibitor directory listing"]
      },
      sponsor: {
        greeting: "Welcome, Valued Sponsor!",
        message: "We deeply appreciate your sponsorship. Verification unlocks sponsor benefits, branding opportunities, and your sponsor recognition badge.",
        benefits: ["Brand visibility at events", "Speaking opportunities", "VIP event invitations", "Sponsorship impact reports"]
      }
    };

    const content = participantContent[participantType] || participantContent.attendee;
    const benefitsList = `<ul style="margin: 0; padding-left: 20px;">${content.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`;

    try {
      // Import db and schema
      const { db } = await import('./db');
      const { emailTemplates } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');

      // Fetch the system email verification template
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.personType, 'system'),
          eq(emailTemplates.templateName, 'Email Verification')
        ))
        .limit(1);

      let subject: string;
      let htmlContent: string;

      if (template && template.isActive) {
        subject = template.subject;
        htmlContent = template.htmlContent;
        
        // Replace all variables including the custom participant content
        const variables: Record<string, string> = {
          '{{firstName}}': recipientName,
          '{{recipientName}}': recipientName,
          '{{welcomeGreeting}}': content.greeting,
          '{{welcomeMessage}}': content.message,
          '{{benefitsList}}': benefitsList,
          '{{verificationLink}}': verificationLink,
        };

        for (const [key, value] of Object.entries(variables)) {
          subject = subject.replace(new RegExp(key, 'g'), value);
          htmlContent = htmlContent.replace(new RegExp(key, 'g'), value);
        }
      } else {
        // Fallback - use simple hardcoded template
        subject = `${content.greeting} - Please Verify Your Email`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Croydon Business Association</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Email Verification Required</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">${content.greeting}</h2>
              <p style="color: #374151; font-size: 18px; margin: 10px 0;">Hello ${recipientName}!</p>
              
              <p style="color: #4b5563; line-height: 1.6;">${content.message}</p>
              
              <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">Your benefits include:</h4>
                ${benefitsList}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">
                  Verify My Email Address
                </a>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚠️ Important:</strong> This verification link will expire in 7 days.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                If you can't click the button, copy and paste this link into your browser:<br>
                <code style="background: #f3f4f6; padding: 5px; border-radius: 3px; word-break: break-all; display: block; margin-top: 10px;">${verificationLink}</code>
              </p>
            </div>
          </div>
        `;
      }

      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: recipientEmail,
        bcc: this.getAdminEmail(), // BCC admin on all emails
        subject: subject,
        html: htmlContent,
      };

      await this.transporter!.sendMail(mailOptions);
      
      // Log the email to database
      await this.logEmail(null, recipientEmail, subject, htmlContent, 'verification', 'sent', {
        participantType,
        verificationToken,
        template: template ? template.templateName : 'default'
      });
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      
      // Log the failed email
      await this.logEmail(null, recipientEmail, 'Email Verification', '', 'verification', 'failed', {
        participantType,
        error: error.message || 'Failed to send verification email'
      });
      
      return {
        success: false,
        message: error.message || 'Failed to send verification email'
      };
    }
  }

  /**
   * Send verification emails to all unverified users (mass send)
   */
  async sendMassVerificationEmails(): Promise<{ 
    success: boolean; 
    totalSent: number; 
    totalFailed: number; 
    results: Array<{ email: string; success: boolean; message: string }> 
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ email: 'system', success: false, message: 'Email service not configured' }]
      };
    }

    try {
      // Import required modules
      const { users } = await import('@shared/schema');
      const { eq, and, isNull, or } = await import('drizzle-orm');
      const crypto = await import('crypto');

      // Get all unverified users
      const unverifiedUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          participantType: users.participantType
        })
        .from(users)
        .where(
          and(
            or(eq(users.emailVerified, false), isNull(users.emailVerified)),
            // Only include users with valid emails
            eq(users.accountStatus, 'active')
          )
        );

      const results: Array<{ email: string; success: boolean; message: string }> = [];
      let totalSent = 0;
      let totalFailed = 0;

      console.log(`Starting mass verification email send to ${unverifiedUsers.length} users`);

      // Send emails in batches to avoid overwhelming the email service
      const batchSize = 10;
      for (let i = 0; i < unverifiedUsers.length; i += batchSize) {
        const batch = unverifiedUsers.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (user) => {
          try {
            if (!user.email) {
              throw new Error('No email address');
            }

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpiry = new Date();
            verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24-hour expiry

            // Update user with verification token
            await db
              .update(users)
              .set({
                verificationToken,
                verificationTokenExpiry,
                updatedAt: new Date()
              })
              .where(eq(users.id, user.id));

            // Send verification email
            const emailResult = await this.sendVerificationEmail(
              user.email,
              user.firstName || 'Member',
              verificationToken,
              user.participantType || 'attendee'
            );

            if (emailResult.success) {
              totalSent++;
              return { 
                email: user.email, 
                success: true, 
                message: 'Verification email sent successfully' 
              };
            } else {
              totalFailed++;
              return { 
                email: user.email, 
                success: false, 
                message: emailResult.message 
              };
            }

          } catch (error) {
            totalFailed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to send verification email to ${user.email}:`, errorMessage);
            return { 
              email: user.email || 'unknown', 
              success: false, 
              message: errorMessage 
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process results
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            totalFailed++;
            results.push({ 
              email: 'unknown', 
              success: false, 
              message: result.reason?.message || 'Promise rejected' 
            });
          }
        });

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < unverifiedUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      console.log(`Mass verification email complete: ${totalSent} sent, ${totalFailed} failed`);

      return {
        success: true,
        totalSent,
        totalFailed,
        results
      };

    } catch (error) {
      console.error('Error in mass verification email send:', error);
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ 
          email: 'system', 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }]
      };
    }
  }

  /**
   * Send verification emails to ALL users in the database (mass send)
   */
  async sendMassVerificationEmailsToAll(): Promise<{ 
    success: boolean; 
    totalSent: number; 
    totalFailed: number; 
    results: Array<{ email: string; success: boolean; message: string }> 
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ email: 'system', success: false, message: 'Email service not configured' }]
      };
    }

    try {
      // Import required modules
      const { users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      const crypto = await import('crypto');

      // Get ALL active users
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          participantType: users.participantType,
          emailVerified: users.emailVerified
        })
        .from(users)
        .where(eq(users.accountStatus, 'active'));

      const results: Array<{ email: string; success: boolean; message: string }> = [];
      let totalSent = 0;
      let totalFailed = 0;

      console.log(`Starting mass verification email send to ALL ${allUsers.length} users`);

      // Send emails in batches to avoid overwhelming the email service
      const batchSize = 10;
      for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (user) => {
          try {
            if (!user.email) {
              throw new Error('No email address');
            }

            // Generate verification token (even for already verified users)
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpiry = new Date();
            verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24-hour expiry

            // Update user with verification token
            await db
              .update(users)
              .set({
                verificationToken,
                verificationTokenExpiry,
                updatedAt: new Date()
              })
              .where(eq(users.id, user.id));

            // Send verification email
            const emailResult = await this.sendVerificationEmail(
              user.email,
              user.firstName || 'Member',
              verificationToken,
              user.participantType || 'attendee'
            );

            if (emailResult.success) {
              totalSent++;
              return { 
                email: user.email, 
                success: true, 
                message: `Verification email sent successfully (${user.emailVerified ? 'already verified' : 'unverified'})` 
              };
            } else {
              totalFailed++;
              return { 
                email: user.email, 
                success: false, 
                message: emailResult.message 
              };
            }

          } catch (error) {
            totalFailed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to send verification email to ${user.email}:`, errorMessage);
            return { 
              email: user.email || 'unknown', 
              success: false, 
              message: errorMessage 
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process results
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            totalFailed++;
            results.push({ 
              email: 'unknown', 
              success: false, 
              message: result.reason?.message || 'Promise rejected' 
            });
          }
        });

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < allUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      console.log(`Mass verification email to ALL users complete: ${totalSent} sent, ${totalFailed} failed`);

      return {
        success: true,
        totalSent,
        totalFailed,
        results
      };

    } catch (error) {
      console.error('Error in mass verification email send to all users:', error);
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ 
          email: 'system', 
          success: false, 
          message: 'System error in mass verification email send to all users' 
        }]
      };
    }
  }

  /**
   * Send an ad hoc email using template from database
   */
  async sendWelcomeEmail(
    recipientEmail: string,
    recipientName: string,
    participantType: string = 'adhoc'
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Email service not configured. Please contact IT support.'
      };
    }

    try {
      // Get the ad hoc email template from database
      const template = await db.select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.personType, 'adhoc'),
          eq(emailTemplates.isActive, true)
        ))
        .limit(1);

      if (!template || template.length === 0) {
        throw new Error('Ad hoc email template not found');
      }

      const emailTemplate = template[0];
      
      // Prepare variables for template replacement
      const templateData = {
        firstName: recipientName.split(' ')[0],
        lastName: recipientName.split(' ').slice(1).join(' '),
        fullName: recipientName,
        email: recipientEmail,
        company: '' // Will be filled by template if needed
      };

      // Replace variables in subject and content
      const subject = this.replaceVariables(emailTemplate.subject, templateData);
      const htmlContent = this.replaceVariables(emailTemplate.htmlContent, templateData);

      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: recipientEmail,
        bcc: this.getAdminEmail(), // BCC admin on template-based emails
        subject: subject,
        html: htmlContent,
      };

      await this.transporter!.sendMail(mailOptions);
      
      // Log the email to database
      await this.logEmail(null, recipientEmail, subject, htmlContent, 'welcome', 'sent', {
        participantType
      });
      
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      
      // Log the failed email
      await this.logEmail(null, recipientEmail, 'Welcome Email', '', 'welcome', 'failed', {
        participantType,
        error: error.message || 'Failed to send welcome email'
      });
      
      return {
        success: false,
        message: error.message || 'Failed to send welcome email'
      };
    }
  }

  /**
   * Send welcome emails to all users (mass send)
   */
  async sendMassWelcomeEmails(): Promise<{ 
    success: boolean; 
    totalSent: number; 
    totalFailed: number; 
    results: Array<{ email: string; success: boolean; message: string }> 
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ email: 'system', success: false, message: 'Email service not configured' }]
      };
    }

    try {
      // Import required modules
      const { users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');

      // Get ALL active users, excluding test accounts to protect Gmail deliverability
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          participantType: users.participantType
        })
        .from(users)
        .where(eq(users.accountStatus, 'active'));

      // Filter out test accounts and bounce-prone email domains
      const testDomains = [
        'test.com', 'example.com', 'example.org', 'test.org', 
        'localhost', '10minutemail', 'guerrillamail', 'mailinator',
        'temp-mail', 'throwaway', 'noreply', 'donotreply',
        'fake.com', 'dummy.com'
      ];
      
      const filteredUsers = allUsers.filter(user => {
        if (!user.email) return false;
        
        // Check for test patterns in email
        const email = user.email.toLowerCase();
        const isTestAccount = testDomains.some(domain => email.includes(domain)) ||
                            email.includes('test') ||
                            email.includes('demo') ||
                            email.includes('sample') ||
                            email.includes('+test') ||
                            email.startsWith('noreply@') ||
                            email.startsWith('donotreply@');
                            
        return !isTestAccount;
      });

      const results: Array<{ email: string; success: boolean; message: string }> = [];
      let totalSent = 0;
      let totalFailed = 0;

      console.log(`Starting mass welcome email send to ${filteredUsers.length} users (${allUsers.length - filteredUsers.length} test accounts excluded for Gmail protection)`);

      // Send emails in small batches to avoid Gmail rate limits
      const batchSize = 3; // Reduced from 10 to 3 for Gmail compliance
      for (let i = 0; i < filteredUsers.length; i += batchSize) {
        const batch = filteredUsers.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(filteredUsers.length/batchSize)} (${batch.length} emails)`);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (user) => {
          try {
            if (!user.email) {
              throw new Error('No email address');
            }

            // Send welcome email
            const emailResult = await this.sendWelcomeEmail(
              user.email,
              user.firstName || 'Member',
              user.participantType || 'attendee'
            );

            if (emailResult.success) {
              totalSent++;
              return { 
                email: user.email, 
                success: true, 
                message: 'Welcome email sent successfully' 
              };
            } else {
              totalFailed++;
              return { 
                email: user.email, 
                success: false, 
                message: emailResult.message 
              };
            }

          } catch (error) {
            totalFailed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to send welcome email to ${user.email}:`, errorMessage);
            return { 
              email: user.email || 'unknown', 
              success: false, 
              message: errorMessage 
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process results
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            totalFailed++;
            results.push({ 
              email: 'unknown', 
              success: false, 
              message: result.reason?.message || 'Promise rejected' 
            });
          }
        });

        // Add delay between batches to avoid Gmail rate limits
        if (i + batchSize < filteredUsers.length) {
          console.log(`⏳ Waiting 10 seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        }
      }

      console.log(`Mass welcome email complete: ${totalSent} sent, ${totalFailed} failed`);

      return {
        success: true,
        totalSent,
        totalFailed,
        results
      };

    } catch (error) {
      console.error('Error in mass welcome email send:', error);
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ 
          email: 'system', 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }]
      };
    }
  }

  /**
   * Send admin welcome email with temporary password
   */
  async sendAdminWelcomeEmail(
    recipientEmail: string,
    recipientName: string,
    temporaryPassword: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Email service not configured. Please contact IT support.'
      };
    }

    const baseUrl = this.getBaseUrl();

    try {
      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: recipientEmail,
        bcc: this.getAdminEmail(), // BCC admin on admin welcome emails
        subject: `Welcome to CBA Admin Portal - Your Administrator Access`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Croydon Business Association</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Administrator Access Granted</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">Welcome ${recipientName}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                You have been granted <strong>Administrator access</strong> to the Croydon Business Association management platform.
                This gives you full access to manage memberships, events, attendance tracking, and all administrative functions.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">🔐 Your Login Credentials:</h3>
                <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px; border: 1px solid #e5e7eb;">
                  <p style="margin: 5px 0; color: #4b5563;">
                    <strong>Email:</strong> ${recipientEmail}<br>
                    <strong>Temporary Password:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 3px; color: #92400e; font-family: monospace;">${temporaryPassword}</code>
                  </p>
                </div>
                <p style="color: #dc2626; margin-top: 15px; font-size: 14px;">
                  ⚠️ <strong>Important:</strong> Please change your password immediately after your first login for security reasons.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">
                  Access Admin Portal
                </a>
              </div>

              <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">As an administrator, you can:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.6;">
                  <li>Manage membership tiers and benefits</li>
                  <li>Create and manage events</li>
                  <li>Track attendance and generate reports</li>
                  <li>View business analytics and insights</li>
                  <li>Import contacts and manage users</li>
                  <li>Handle sponsorships and partnerships</li>
                </ul>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                If you have any questions or need assistance, please contact the IT support team at 
                <a href="mailto:support@croydonba.org.uk" style="color: #3b82f6;">support@croydonba.org.uk</a>
              </p>
            </div>
          </div>
        `,
        text: `
Welcome ${recipientName}!

You have been granted Administrator access to the Croydon Business Association management platform.

Your Login Credentials:
Email: ${recipientEmail}
Temporary Password: ${temporaryPassword}

IMPORTANT: Please change your password immediately after your first login for security reasons.

Access the admin portal at: ${baseUrl}/login

If you have any questions, please contact support@croydonba.org.uk

Best regards,
Croydon Business Association
        `
      };

      await this.transporter!.sendMail(mailOptions);
      return { 
        success: true, 
        message: 'Admin welcome email sent successfully' 
      };
    } catch (error) {
      console.error('Failed to send admin welcome email:', error);
      return { 
        success: false, 
        message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Send printable badge via email
   */
  async sendPrintableBadge(
    recipientEmail: string,
    recipientName: string,
    badgeHTML: string,
    badgeId: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: recipientEmail,
        bcc: this.getAdminEmail(), // BCC admin on badge emails
        subject: `Your AI Summit 2025 Badge - Ready to Print`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">AI Summit 2025</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Printable Badge is Ready!</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">Hello ${recipientName}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Thank you for registering for the <strong>First AI Summit Croydon 2025</strong>! 
                Your registration is confirmed and your printable badge is attached to this email.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">📋 What to do next:</h3>
                <ol style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                  <li><strong>Download and print</strong> the attached badge on A4 paper</li>
                  <li><strong>Cut out the badge</strong> along the border lines</li>
                  <li><strong>Attach to clothing</strong> with a pin, clip, or lanyard</li>
                  <li><strong>Bring to the event</strong> on October 1st, 2025</li>
                  <li><strong>Present at entrance</strong> for QR code scanning</li>
                </ol>
              </div>
              
              <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af; font-weight: 500;">
                  📅 <strong>Event Details:</strong><br>
                  Date: October 1st, 2025<br>
                  Time: 10:00 AM - 4:00 PM<br>
                  Venue: LSBU London South Bank University Croydon<br>
                  Badge ID: ${badgeId}
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                <strong>Lost your badge or need help?</strong> Contact us at 
                <a href="mailto:info@croydonbusiness.co.uk" style="color: #3b82f6;">info@croydonbusiness.co.uk</a> 
                or visit the registration desk on the day.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                We look forward to seeing you at the AI Summit!
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>Croydon Business Association</strong><br>
                  AI Summit 2025 Team
                </p>
              </div>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `AI-Summit-2025-Badge-${badgeId}.html`,
            content: badgeHTML,
            contentType: 'text/html'
          }
        ]
      };

      await this.transporter!.sendMail(mailOptions);
      return { 
        success: true, 
        message: `Printable badge sent successfully to ${recipientEmail}` 
      };

    } catch (error: any) {
      console.error('Email send error:', error);
      return { 
        success: false, 
        message: `Failed to send email: ${error.message}` 
      };
    }
  }

  public async sendPasswordResetEmail(to: string, resetToken: string, userName?: string): Promise<boolean> {
    const subject = 'Password Reset - Croydon Business Association';
    
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Password reset token:', resetToken);
      console.warn(`Reset URL: ${this.getBaseUrl()}/reset-password?token=${resetToken}`);
      
      // Log failed attempt to database
      await this.logEmail(null, to, subject, 'Email service not configured', 'password_reset', 'failed', { 
        error: 'Email service not configured',
        resetToken 
      });
      
      return false;
    }

    const resetUrl = `${this.getBaseUrl()}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Croydon Business Association</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background-color: #f9f9f9; }
          .button { 
            display: inline-block; 
            background-color: #0066cc; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Croydon Business Association</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            <p>You've requested to reset your password for your Croydon Business Association account. Click the button below to create a new password:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #eeeeee; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            
            <p><strong>This link will expire in 7 days</strong> for security reasons.</p>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>
            The Croydon Business Association Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Password Reset Request - Croydon Business Association
      
      Hello${userName ? ` ${userName}` : ''},
      
      You've requested to reset your password for your Croydon Business Association account.
      
      Please click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      
      Best regards,
      The Croydon Business Association Team
    `;

    try {
      console.log(`Attempting to send email from: ${this.config!.fromEmail} to: ${to}`);
      console.log(`SMTP Host: ${this.config!.host}:${this.config!.port}, Secure: ${this.config!.secure}`);
      
      const result = await this.transporter!.sendMail({
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Password reset email sent to ${to}. Message ID: ${result.messageId}`);
      console.log('SMTP Response:', result.response);
      
      // Log successful email to database
      await this.logEmail(null, to, subject, htmlContent, 'password_reset', 'sent', { 
        resetToken,
        userName: userName || 'Member',
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      console.error('SMTP Error details:', error);
      
      // Log failed email to database
      await this.logEmail(null, to, subject, htmlContent, 'password_reset', 'failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        resetToken,
        userName: userName || 'Member'
      });
      
      // Fall back to console logging for development
      console.warn('Email failed, logging reset info:');
      console.warn(`Reset URL: ${resetUrl}`);
      return false;
    }
  }

  // Bulk password reset email function for imported users without passwords
  async sendMassPasswordResetEmails(): Promise<{ 
    success: boolean; 
    totalSent: number; 
    totalFailed: number; 
    results: Array<{ email: string; success: boolean; message: string }> 
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [{ email: 'system', success: false, message: 'Email service not configured' }]
      };
    }

    try {
      // Import required modules
      const { users, passwordResetTokens } = await import('@shared/schema');
      const { eq, isNull, or, and } = await import('drizzle-orm');
      const crypto = await import('crypto');

      // Get all users without passwords (imported users)
      const usersNeedingPasswords = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(and(
          eq(users.accountStatus, 'active'),
          or(
            isNull(users.passwordHash),
            eq(users.passwordHash, '')
          )
        ));

      const results: Array<{ email: string; success: boolean; message: string }> = [];
      let totalSent = 0;
      let totalFailed = 0;

      console.log(`Starting mass password reset email send to ${usersNeedingPasswords.length} users without passwords`);

      // Send emails in batches to avoid overwhelming the email service
      const batchSize = 10;
      for (let i = 0; i < usersNeedingPasswords.length; i += batchSize) {
        const batch = usersNeedingPasswords.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (user) => {
          try {
            if (!user.email) {
              throw new Error('No email address');
            }

            // Generate password reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date();
            resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24); // 24-hour expiry

            // Save password reset token to database
            await db.insert(passwordResetTokens).values({
              userId: user.id,
              token: resetToken,
              expiresAt: resetTokenExpiry,
              createdAt: new Date()
            });

            // Send password reset email
            const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Member';
            const emailResult = await this.sendPasswordResetEmail(
              user.email,
              resetToken,
              userName
            );

            if (emailResult) {
              totalSent++;
              results.push({ email: user.email, success: true, message: 'Password reset email sent successfully' });
            } else {
              throw new Error('Failed to send password reset email');
            }
          } catch (error: any) {
            totalFailed++;
            results.push({ 
              email: user.email || 'unknown', 
              success: false, 
              message: error.message 
            });
            console.error(`Failed to send password reset email to ${user.email}:`, error.message);
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);

        // Add delay between batches to avoid rate limits
        if (i + batchSize < usersNeedingPasswords.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        console.log(`Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(usersNeedingPasswords.length/batchSize)} completed: ${batch.length} emails processed`);
      }

      console.log(`Mass password reset email complete: ${totalSent} sent, ${totalFailed} failed`);

      return {
        success: totalSent > 0,
        totalSent,
        totalFailed,
        results
      };
    } catch (error: any) {
      console.error('Mass password reset email failed:', error);
      return {
        success: false,
        totalSent: 0,
        totalFailed: 1,
        results: [{ email: 'system', success: false, message: error.message }]
      };
    }
  }

  public async sendSimpleTestEmail(to: string, userName: string = 'Test User'): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Test email not sent to:', to);
      return false;
    }

    const simpleHtml = `
      <html>
        <body>
          <h2>Test Email from Croydon Business Association</h2>
          <p>Hello ${userName},</p>
          <p>This is a simple test email to verify our email system is working.</p>
          <p>If you receive this, the email configuration is successful!</p>
          <p>Best regards,<br>CBA Team</p>
        </body>
      </html>
    `;

    try {
      console.log(`Sending simple test email from: ${this.config!.fromEmail} to: ${to}`);
      console.log(`SMTP Config: ${this.config!.host}:${this.config!.port}, User: ${this.config!.user}`);
      
      // First, verify the SMTP connection
      try {
        await this.transporter!.verify();
        console.log('SMTP connection verified successfully');
      } catch (verifyError) {
        console.error('SMTP verification failed:', verifyError);
        return false;
      }
      
      // Try with minimal headers and very simple content
      const result = await this.transporter!.sendMail({
        from: this.config!.fromEmail,
        to,
        subject: 'Test Email from CBA Platform',
        text: `Hello ${userName}, this is a test email to verify the system is working.`,
        html: simpleHtml,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'NodeMailer',
          'Importance': 'Normal'
        }
      });

      console.log(`✅ Test email sent successfully to ${to}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📤 SMTP Response: ${result.response}`);
      console.log(`🔐 Authentication: ${result.accepted?.length > 0 ? 'ACCEPTED' : 'REJECTED'}`);
      
      return true;
    } catch (error) {
      console.error('❌ FAILED to send test email:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      return false;
    }
  }


  public async sendNotificationEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Email not sent to:', to);
      return false;
    }

    try {
      await this.transporter!.sendMail({
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to,
        bcc: this.getAdminEmail(), // BCC admin on notification emails
        subject,
        html,
      });

      console.log(`Notification email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }
  }

  public async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.transporter!.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  /**
   * Replace variables in template content
   */
  replaceVariables(content: string, data: Record<string, any>): string {
    let result = content;
    
    // Replace each variable with actual data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });
    
    return result;
  }
}

// Export singleton instance
export const emailService = new EmailService();