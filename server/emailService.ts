import nodemailer from 'nodemailer';

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
    if (process.env.REPLIT_DOMAINS) {
      const domain = process.env.REPLIT_DOMAINS.split(',')[0];
      return `https://${domain}`;
    }
    return 'http://localhost:5000';
  }

  private initializeFromEnv() {
    // Try to initialize from environment variables
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL;
    const fromName = process.env.FROM_NAME || 'Croydon Business Association';

    if (host && port && user && password && fromEmail) {
      this.config = {
        host,
        port: parseInt(port),
        secure: port === '465', // true for 465, false for other ports
        user,
        password,
        fromEmail,
        fromName,
      };
      this.createTransporter();
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
                <a href="${baseUrl}/admin-login" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">
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

Access the admin portal at: ${baseUrl}/admin-login

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
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Password reset token:', resetToken);
      console.warn(`Reset URL: ${this.getBaseUrl()}/reset-password?token=${resetToken}`);
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
            
            <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
            
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
      await this.transporter!.sendMail({
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to,
        subject: 'Password Reset - Croydon Business Association',
        text: textContent,
        html: htmlContent,
      });

      console.log(`Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Fall back to console logging for development
      console.warn('Email failed, logging reset info:');
      console.warn(`Reset URL: ${resetUrl}`);
      return false;
    }
  }

  public async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Welcome email not sent to:', to);
      return false;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Croydon Business Association</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Croydon Business Association</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${userName}!</h2>
            <p>Thank you for joining the Croydon Business Association. We're excited to have you as part of our growing business community.</p>
            
            <p>Here's what you can do with your new account:</p>
            <ul>
              <li>Create and manage your business profile</li>
              <li>Post special offers for other members</li>
              <li>Browse and connect with local businesses</li>
              <li>Access member-only benefits and resources</li>
            </ul>
            
            <p>To get started, please log in to your account and complete your business profile.</p>
            
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            
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

    try {
      await this.transporter!.sendMail({
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to,
        subject: 'Welcome to Croydon Business Association',
        html: htmlContent,
      });

      console.log(`Welcome email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
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
}

// Export singleton instance
export const emailService = new EmailService();