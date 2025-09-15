import { db } from "./db";
import { users, personTypes, userPersonTypes, emailTemplates } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { EmailService } from "./emailService";
import { MyTAutomationService } from "./mytAutomationService";
import { EmailTemplateService } from "./emailTemplateService";

interface OnboardingMessage {
  subject: string;
  htmlContent: string;
  smsContent?: string;
  mytTags?: string[];
  mytWorkflow?: string;
}

interface UserWithTypes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  personTypes: string[];
  membershipTier?: string;
}

export class OnboardingService {
  // Get user's person types
  private async getUserPersonTypes(userId: string): Promise<string[]> {
    const userTypes = await db
      .select({
        typeName: personTypes.name
      })
      .from(userPersonTypes)
      .innerJoin(personTypes, eq(userPersonTypes.personTypeId, personTypes.id))
      .where(eq(userPersonTypes.userId, userId));
    
    return userTypes.map(ut => ut.typeName);
  }

  // Get welcome message based on user type from database or fallback to default
  private async getWelcomeMessage(userType: string, user: UserWithTypes): Promise<OnboardingMessage> {
    const emailTemplateService = new EmailTemplateService();
    const template = await emailTemplateService.getTemplate(userType);
    
    if (template) {
      // Prepare data for variable replacement
      const data = {
        firstName: user.firstName || "Member",
        lastName: user.lastName || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Member",
        email: user.email,
        company: user.company || "",
        membershipTier: user.membershipTier || "Starter Tier",
        // Add more variables as needed
        venue: "Croydon Conference Centre",
        badgeId: user.id.slice(0, 8).toUpperCase(),
        eventName: "AI Summit 2025",
        eventDate: "October 1st, 2025"
      };

      return {
        subject: emailTemplateService.replaceVariables(template.subject, data),
        htmlContent: emailTemplateService.replaceVariables(template.htmlContent, data),
        smsContent: template.smsContent ? emailTemplateService.replaceVariables(template.smsContent, data) : undefined,
        mytTags: template.mytTags || [],
        mytWorkflow: template.mytWorkflow || undefined
      };
    }

    // Fallback to hardcoded message if no template found
    return this.getDefaultWelcomeMessage(userType, user);
  }

  // Fallback welcome messages if no template in database
  private getDefaultWelcomeMessage(userType: string, user: UserWithTypes): OnboardingMessage {
    const firstName = user.firstName || "Member";
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Member";
    
    const messages: Record<string, OnboardingMessage> = {
      volunteer: {
        subject: "Welcome to the CBA Volunteer Team! 🌟",
        mytTags: ["volunteer", "ai-summit-2025", "onboarded", "volunteer-active"],
        mytWorkflow: "volunteer-onboarding-sequence",
        htmlContent: `
          <h2>Welcome ${firstName}!</h2>
          <p>Thank you for joining our volunteer community at the Croydon Business Association!</p>
          
          <h3>As a Volunteer, you get access to:</h3>
          <ul>
            <li>📱 Your personalized digital volunteer badge</li>
            <li>🎯 Priority event access and special volunteer-only sessions</li>
            <li>📚 Free training workshops and skill development programs</li>
            <li>🏆 Recognition awards and certificates</li>
            <li>🤝 Networking opportunities with business leaders</li>
            <li>💼 Job opportunities and career mentoring</li>
          </ul>
          
          <h3>Your Next Steps:</h3>
          <ol>
            <li>Access your volunteer dashboard at /dashboard</li>
            <li>Download your digital badge at /mobile-badge</li>
            <li>Join our volunteer WhatsApp group (link in dashboard)</li>
            <li>Sign up for your first volunteer shift</li>
            <li>Complete your volunteer profile for better opportunities</li>
          </ol>
          
          <p>We're excited to have you make a difference in our community!</p>
          
          <p>Need help? Contact our Volunteer Coordinator at volunteers@croydonba.org.uk</p>
        `,
        smsContent: `Welcome ${firstName}! You're now part of the CBA Volunteer Team. Access your dashboard to get started and download your volunteer badge. We're excited to have you!`
      },
      
      vip: {
        subject: "VIP Welcome - Exclusive Access to Croydon Business Association",
        mytTags: ["vip", "ai-summit-2025", "onboarded", "vip-active", "priority-support"],
        mytWorkflow: "vip-concierge-sequence",
        htmlContent: `
          <h2>Welcome ${fullName}</h2>
          <p>We're honored to have you as a VIP member of the Croydon Business Association.</p>
          
          <h3>Your VIP Benefits Include:</h3>
          <ul>
            <li>🎖️ VIP digital badge with priority access</li>
            <li>🥇 Reserved seating at all events</li>
            <li>🍾 Access to VIP lounge and hospitality</li>
            <li>📞 Direct line to executive team</li>
            <li>🎯 Invitation to exclusive VIP-only events</li>
            <li>🚗 Complimentary parking at venues</li>
            <li>💼 Priority business matching services</li>
          </ul>
          
          <h3>Your VIP Concierge Service:</h3>
          <p>Your dedicated VIP coordinator will contact you within 24 hours to:</p>
          <ul>
            <li>Schedule a personal welcome meeting</li>
            <li>Understand your business needs</li>
            <li>Arrange introductions to key stakeholders</li>
            <li>Customize your membership experience</li>
          </ul>
          
          <p>VIP Hotline: 020 1234 5678 (9am-9pm, 7 days)</p>
          <p>VIP Email: vip@croydonba.org.uk</p>
        `,
        smsContent: `Welcome ${fullName}! Your VIP membership is active. Your dedicated coordinator will contact you within 24 hours. VIP Hotline: 020 1234 5678`
      },
      
      speaker: {
        subject: "Speaker Welcome - AI Summit 2025 🎤",
        mytTags: ["speaker", "ai-summit-2025", "onboarded", "speaker-confirmed"],
        mytWorkflow: "speaker-preparation-sequence",
        htmlContent: `
          <h2>Welcome ${fullName}!</h2>
          <p>Thank you for joining us as a speaker at the AI Summit 2025!</p>
          
          <h3>Speaker Resources & Benefits:</h3>
          <ul>
            <li>🎤 Your official speaker badge and credentials</li>
            <li>📊 Access to speaker resource portal</li>
            <li>🎥 Professional recording of your session</li>
            <li>📸 Professional photography package</li>
            <li>🍽️ Complimentary speaker dinner invitation</li>
            <li>🏨 Accommodation assistance if needed</li>
            <li>📱 Speaker WhatsApp group access</li>
          </ul>
          
          <h3>Important Deadlines:</h3>
          <ul>
            <li>📝 Submit final presentation: 7 days before event</li>
            <li>🎯 Tech check session: 3 days before event</li>
            <li>📋 Provide session requirements: ASAP</li>
            <li>📸 Upload headshot for marketing: Within 48 hours</li>
          </ul>
          
          <h3>Your Speaker Coordinator:</h3>
          <p>Sarah Johnson will be your point of contact</p>
          <p>Email: speakers@aisummit.org.uk</p>
          <p>Phone: 020 9876 5432</p>
          
          <p>We look forward to your valuable contribution!</p>
        `,
        smsContent: `Welcome Speaker ${fullName}! Your AI Summit speaker account is ready. Check your email for important deadlines and resources. Speaker support: 020 9876 5432`
      },
      
      exhibitor: {
        subject: "Exhibitor Welcome Pack - AI Summit 2025 🏢",
        mytTags: ["exhibitor", "ai-summit-2025", "onboarded", "exhibitor-active"],
        mytWorkflow: "exhibitor-onboarding-sequence",
        htmlContent: `
          <h2>Welcome ${fullName} from ${user.company || "your company"}!</h2>
          <p>Thank you for exhibiting at the AI Summit 2025!</p>
          
          <h3>Your Exhibition Package Includes:</h3>
          <ul>
            <li>🏢 Stand location: Will be confirmed within 48 hours</li>
            <li>👥 4 exhibitor badges for your team</li>
            <li>📱 Lead scanning app access</li>
            <li>🎯 Pre-event attendee matching</li>
            <li>📢 Marketing package (social media, website listing)</li>
            <li>🚚 Logistics support for stand setup</li>
            <li>☕ Exhibitor lounge access</li>
          </ul>
          
          <h3>Key Dates & Actions:</h3>
          <ol>
            <li>Submit stand design: By March 15</li>
            <li>Order additional services: By March 20</li>
            <li>Setup day: March 27 (8am-6pm)</li>
            <li>Exhibition days: March 28-29</li>
            <li>Breakdown: March 29 (6pm-10pm)</li>
          </ol>
          
          <h3>Exhibitor Portal:</h3>
          <p>Access your exhibitor portal at: /exhibitor-dashboard</p>
          <p>Here you can:</p>
          <ul>
            <li>Manage team badges</li>
            <li>Order catering and furniture</li>
            <li>Book meeting rooms</li>
            <li>Access visitor analytics</li>
            <li>Download lead data</li>
          </ul>
          
          <p>Exhibitor Support: exhibitors@aisummit.org.uk | 020 8765 4321</p>
        `,
        smsContent: `Welcome Exhibitor! Your AI Summit exhibition package is confirmed. Access your portal for stand setup and team badges. Support: 020 8765 4321`
      },
      
      sponsor: {
        subject: "Sponsor Welcome - Thank You for Your Partnership! 🤝",
        mytTags: ["sponsor", "ai-summit-2025", "onboarded", "sponsor-active", "vip-partner"],
        mytWorkflow: "sponsor-partnership-sequence",
        htmlContent: `
          <h2>Dear ${fullName},</h2>
          <p>On behalf of the entire Croydon Business Association, thank you for your sponsorship!</p>
          
          <h3>Your Sponsorship Benefits:</h3>
          <ul>
            <li>🌟 Premium brand visibility across all channels</li>
            <li>🎤 Speaking opportunity at main stage</li>
            <li>🏆 Title sponsor recognition</li>
            <li>📱 Logo on all digital platforms</li>
            <li>🎟️ 20 complimentary event passes</li>
            <li>🏢 Premium exhibition space</li>
            <li>📊 Post-event impact report</li>
            <li>🤝 Year-round partnership benefits</li>
          </ul>
          
          <h3>Your Dedicated Account Manager:</h3>
          <p>Michael Chen, Partnership Director</p>
          <p>Direct: 020 7654 3210</p>
          <p>Mobile: 07700 900123</p>
          <p>Email: michael@croydonba.org.uk</p>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Schedule kickoff meeting (this week)</li>
            <li>Provide logo assets for marketing</li>
            <li>Confirm speaking slot preferences</li>
            <li>Review partnership agreement</li>
            <li>Plan activation strategy</li>
          </ol>
          
          <p>We're thrilled to have you as our partner!</p>
        `,
        smsContent: `Welcome Partner! Thank you for sponsoring CBA. Michael Chen, your account manager, will contact you today. Direct: 020 7654 3210`
      },
      
      team_member: {
        subject: "Welcome to the CBA Team! 🎉",
        mytTags: ["team-member", "staff", "onboarded", "internal-team"],
        mytWorkflow: "team-member-onboarding-sequence",
        htmlContent: `
          <h2>Welcome to the team, ${firstName}!</h2>
          <p>We're excited to have you join the Croydon Business Association team!</p>
          
          <h3>Your Team Member Access:</h3>
          <ul>
            <li>🏢 Staff dashboard with full administrative access</li>
            <li>📱 Team digital badge with staff credentials</li>
            <li>🔐 Access to all backend systems</li>
            <li>📊 Analytics and reporting tools</li>
            <li>👥 Team collaboration workspace</li>
            <li>📚 Internal knowledge base and training</li>
          </ul>
          
          <h3>First Week Checklist:</h3>
          <ol>
            <li>Complete HR onboarding (link in dashboard)</li>
            <li>Set up your team email signature</li>
            <li>Join team Slack workspace</li>
            <li>Schedule 1-on-1 with your manager</li>
            <li>Review team handbook and policies</li>
            <li>Complete security training</li>
            <li>Get building access card from reception</li>
          </ol>
          
          <h3>Your Team Contacts:</h3>
          <ul>
            <li>HR: hr@croydonba.org.uk</li>
            <li>IT Support: it@croydonba.org.uk</li>
            <li>Team Lead: Will introduce themselves today</li>
          </ul>
          
          <p>Welcome aboard! We're looking forward to working with you!</p>
        `,
        smsContent: `Welcome to CBA Team ${firstName}! Check your email for onboarding instructions. Your team lead will contact you today. IT Support: it@croydonba.org.uk`
      },
      
      student: {
        subject: "Student Welcome - Unlock Your Future! 🎓",
        mytTags: ["student", "education", "onboarded", "student-active"],
        mytWorkflow: "student-engagement-sequence",
        htmlContent: `
          <h2>Welcome ${firstName}!</h2>
          <p>Great to have you join the CBA Student Community!</p>
          
          <h3>Exclusive Student Benefits:</h3>
          <ul>
            <li>🎓 FREE access to all workshops and training</li>
            <li>💼 Internship and job opportunities</li>
            <li>👔 CV review and career coaching</li>
            <li>🏆 Student entrepreneurship programs</li>
            <li>📚 Access to business resource library</li>
            <li>🤝 Mentorship matching with business leaders</li>
            <li>🎟️ Discounted event tickets (up to 80% off)</li>
            <li>📱 Student digital badge</li>
          </ul>
          
          <h3>Get Started:</h3>
          <ol>
            <li>Complete your student profile</li>
            <li>Upload your CV for opportunities</li>
            <li>Join student WhatsApp group</li>
            <li>Register for upcoming workshops</li>
            <li>Apply for mentorship program</li>
          </ol>
          
          <h3>Upcoming Student Events:</h3>
          <ul>
            <li>Career Fair - April 5</li>
            <li>Startup Bootcamp - April 12-13</li>
            <li>LinkedIn Workshop - April 20</li>
            <li>Mock Interview Day - April 27</li>
          </ul>
          
          <p>Student Support: students@croydonba.org.uk</p>
        `,
        smsContent: `Welcome ${firstName}! Your CBA Student membership is active. FREE workshops, job opportunities, and mentorship await! Check email for details.`
      },
      
      councillor: {
        subject: "Councillor Welcome - Partnership for Croydon's Success",
        mytTags: ["councillor", "government", "onboarded", "councillor-active"],
        mytWorkflow: "councillor-engagement-sequence",
        htmlContent: `
          <h2>Dear Councillor ${fullName},</h2>
          <p>We're honored to welcome you to the Croydon Business Association network.</p>
          
          <h3>Councillor Partnership Benefits:</h3>
          <ul>
            <li>🏛️ Direct engagement with business community</li>
            <li>📊 Access to business insights and data</li>
            <li>🤝 Facilitated constituent meetings</li>
            <li>🎤 Speaking opportunities at events</li>
            <li>📱 Official councillor digital credentials</li>
            <li>📰 Platform for policy announcements</li>
            <li>🏢 Business roundtable invitations</li>
          </ul>
          
          <h3>How We Support Your Work:</h3>
          <ul>
            <li>Monthly business sentiment reports</li>
            <li>Constituent business directory access</li>
            <li>Economic impact data for your ward</li>
            <li>Business community feedback channel</li>
            <li>Joint initiative opportunities</li>
          </ul>
          
          <h3>Upcoming Engagement Opportunities:</h3>
          <ul>
            <li>Business Leaders Breakfast - First Tuesday monthly</li>
            <li>Ward Business Forums - Quarterly</li>
            <li>Economic Summit - June 15</li>
            <li>Skills & Employment Taskforce - Monthly</li>
          </ul>
          
          <p>Government Relations: gov@croydonba.org.uk | 020 5432 1098</p>
        `,
        smsContent: `Welcome Councillor ${fullName}. Your CBA partnership is active. Monthly business breakfast is next Tuesday. Gov Relations: 020 5432 1098`
      },
      
      media: {
        subject: "Media Accreditation Confirmed - Full Access Granted 📰",
        mytTags: ["media", "press", "onboarded", "media-active"],
        mytWorkflow: "media-relations-sequence",
        htmlContent: `
          <h2>Welcome ${fullName} from ${user.company || "your organization"}!</h2>
          <p>Your media accreditation for CBA events has been approved.</p>
          
          <h3>Media Access Includes:</h3>
          <ul>
            <li>📰 Press badge with full venue access</li>
            <li>📸 Photography and filming permissions</li>
            <li>🎤 Press conference access</li>
            <li>📁 Digital press kit and resources</li>
            <li>👔 Interview scheduling system</li>
            <li>📡 Dedicated media workspace</li>
            <li>📶 High-speed media WiFi</li>
          </ul>
          
          <h3>Media Resources:</h3>
          <ul>
            <li>Press releases: /media/press-releases</li>
            <li>High-res images: /media/gallery</li>
            <li>Speaker bios: /media/speakers</li>
            <li>Statistics & data: /media/facts</li>
            <li>Interview requests: media@croydonba.org.uk</li>
          </ul>
          
          <h3>Media Contacts:</h3>
          <p>Press Office: 020 4321 0987 (24/7 during events)</p>
          <p>Media Coordinator: Jane Smith</p>
          <p>Email: media@croydonba.org.uk</p>
          <p>WhatsApp: 07700 media1</p>
        `,
        smsContent: `Media access confirmed! Collect your press badge at registration. Press Office: 020 4321 0987. Full resources at /media`
      },
      
      // Default for regular attendees/members
      attendee: {
        subject: "Welcome to Croydon Business Association! 🎉",
        mytTags: ["attendee", "member", "onboarded", "attendee-active"],
        mytWorkflow: "member-onboarding-sequence",
        htmlContent: `
          <h2>Welcome ${firstName}!</h2>
          <p>Thank you for joining the Croydon Business Association community!</p>
          
          <h3>Your Member Benefits:</h3>
          <ul>
            <li>🎟️ Access to networking events and workshops</li>
            <li>📱 Your personal digital badge</li>
            <li>📊 Business resources and tools</li>
            <li>🤝 Networking opportunities</li>
            <li>💼 Business directory listing</li>
            <li>📰 Weekly newsletter with opportunities</li>
            <li>🎯 Member-only special offers</li>
          </ul>
          
          <h3>Get Started:</h3>
          <ol>
            <li>Complete your profile at /my-profile</li>
            <li>Download your digital badge at /mobile-badge</li>
            <li>Browse upcoming events at /events</li>
            <li>Connect with other members at /directory</li>
            <li>Explore member benefits at /my-benefits</li>
          </ol>
          
          <h3>Your Membership: ${user.membershipTier || "Starter Tier"}</h3>
          <p>Upgrade anytime to unlock more benefits!</p>
          
          <p>Need help? Contact us at hello@croydonba.org.uk</p>
        `,
        smsContent: `Welcome ${firstName}! Your CBA membership is active. Access your dashboard to get started and download your digital badge. Questions? hello@croydonba.org.uk`
      }
    };
    
    return messages[userType] || messages.attendee;
  }

  // Send onboarding email and SMS
  public async sendOnboarding(userId: string): Promise<void> {
    try {
      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user || !user.email) {
        console.error(`User not found or no email for user ${userId}`);
        return;
      }
      
      // Get user's person types
      const userTypes = await this.getUserPersonTypes(userId);
      
      // Determine primary type for onboarding
      // Priority order: vip > sponsor > speaker > exhibitor > team_member > councillor > volunteer > student > media > attendee
      const typeHierarchy = [
        'vip', 'sponsor', 'speaker', 'exhibitor', 'team_member', 
        'councillor', 'volunteer', 'student', 'media', 'attendee'
      ];
      
      let primaryType = 'attendee';
      for (const type of typeHierarchy) {
        if (userTypes.includes(type)) {
          primaryType = type;
          break;
        }
      }
      
      // Get personalized message
      const userWithTypes: UserWithTypes = {
        id: user.id,
        email: user.email!,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        company: user.company || undefined,
        personTypes: userTypes,
        membershipTier: user.membershipTier || undefined
      };
      
      const message = await this.getWelcomeMessage(primaryType, userWithTypes);
      
      // Welcome emails now handled by MYT Automation workflows
      let emailStatus = 'myt_automation';
      
      // Record email communication
      const { emailCommunications } = await import("@shared/schema");
      await db.insert(emailCommunications).values({
        userId: user.id,
        subject: message.subject,
        content: message.htmlContent,
        emailType: 'onboarding',
        status: emailStatus,
        metadata: {
          personType: primaryType,
          mytTags: message.mytTags,
          mytWorkflow: message.mytWorkflow,
          templateUsed: `onboarding_${primaryType}`
        }
      });
      
      // Sync with MyT Automation
      try {
        const mytService = new MyTAutomationService();
        
        // Check if contact exists or create new one
        let contact = await mytService.getContactByEmail(user.email);
        
        if (!contact) {
          // Create new contact in MyT Automation
          contact = await mytService.createContact({
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            companyName: user.company || '',
            tags: message.mytTags || [],
            customFields: {
              membership_tier: user.membershipTier || 'Starter',
              person_type: primaryType,
              onboarded: true,
              onboarding_date: new Date().toISOString()
            }
          });
          console.log(`Created new MyT Automation contact for ${user.email}`);
        } else {
          // Update existing contact with tags
          const existingTags = contact.tags || [];
          const newTags = message.mytTags || [];
          const combinedTags = Array.from(new Set([...existingTags, ...newTags]));
          
          await mytService.updateContact(contact.id, {
            tags: combinedTags,
            customFields: {
              ...contact.customFields,
              membership_tier: user.membershipTier || 'Starter',
              person_type: primaryType,
              onboarded: true,
              onboarding_date: new Date().toISOString()
            }
          });
          console.log(`Updated MyT Automation contact for ${user.email} with tags: ${newTags.join(', ')}`);
        }
        
        // Add contact to workflow if specified (this triggers welcome emails in MYT Automation)
        if (message.mytWorkflow && contact) {
          await mytService.addContactToWorkflow(contact.id, message.mytWorkflow);
          console.log(`Added ${user.email} to MYT Automation workflow: ${message.mytWorkflow} (welcome email will be sent automatically)`);
          emailStatus = 'myt_workflow_triggered';
        } else {
          console.log(`No workflow specified for ${primaryType} - welcome email may need manual trigger in MYT Automation`);
        }
        
        // Send SMS via MyT Automation if available
        if (user.phone && message.smsContent) {
          await mytService.sendSMS(contact.id, message.smsContent);
          console.log(`SMS sent to ${user.phone} via MyT Automation`);
        }
        
      } catch (error) {
        console.error('Error syncing with MyT Automation:', error);
        emailStatus = 'myt_automation_failed';
        // Don't throw - we still want to complete onboarding even if MyT sync fails
      }
      
      // Log onboarding completion
      console.log(`✅ Onboarding completed for ${user.email} as ${primaryType} - Status: ${emailStatus}`);
      
      if (emailStatus === 'myt_workflow_triggered') {
        console.log(`📧 Welcome email will be sent automatically by MYT Automation workflow`);
      } else if (emailStatus === 'myt_automation_failed') {
        console.log(`⚠️  MYT Automation sync failed - welcome email may need manual trigger`);
      }
      
      // Update user to mark onboarding as sent (optional)
      await db
        .update(users)
        .set({ 
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
        
    } catch (error) {
      console.error(`Error sending onboarding for user ${userId}:`, error);
      throw error;
    }
  }

  // Bulk send onboarding to multiple users
  public async bulkSendOnboarding(userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      try {
        await this.sendOnboarding(userId);
        // Add delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send onboarding to user ${userId}:`, error);
      }
    }
  }
}

export const onboardingService = new OnboardingService();