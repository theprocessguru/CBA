import axios, { AxiosInstance } from 'axios';

export interface MyTAutomationContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface MyTAutomationOpportunity {
  id: string;
  name: string;
  status: string;
  monetaryValue?: number;
  contactId: string;
}

export interface MyTAutomationCompany {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  customFields?: Record<string, any>;
}

export class MyTAutomationService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('GHL_API_KEY is required for MyT Automation');
    }

    this.api = axios.create({
      baseURL: 'https://rest.gohighlevel.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all contacts
  async getContacts(): Promise<MyTAutomationContact[]> {
    try {
      const response = await this.api.get('/contacts');
      return response.data.contacts || [];
    } catch (error) {
      console.error('Error fetching MyT Automation contacts:', error);
      throw new Error('Failed to fetch contacts from MyT Automation');
    }
  }

  // Get contact by email
  async getContactByEmail(email: string): Promise<MyTAutomationContact | null> {
    try {
      const response = await this.api.get('/contacts', {
        params: { email }
      });
      const contacts = response.data.contacts || [];
      return contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      console.error('Error fetching MyT Automation contact by email:', error);
      return null;
    }
  }

  // Create or update contact
  async upsertContact(contactData: Partial<MyTAutomationContact>): Promise<MyTAutomationContact> {
    try {
      // Check if contact exists
      if (contactData.email) {
        const existingContact = await this.getContactByEmail(contactData.email);
        
        if (existingContact) {
          // For updates, remove email to avoid duplicate error
          const updateData = { ...contactData };
          delete updateData.email; // Don't send email when updating
          
          // Merge tags instead of replacing
          if (updateData.tags && existingContact.tags) {
            const existingTags = new Set(existingContact.tags);
            updateData.tags.forEach(tag => existingTags.add(tag));
            updateData.tags = Array.from(existingTags);
          }
          
          // Update existing contact
          try {
            const response = await this.api.put(`/contacts/${existingContact.id}`, updateData);
            return response.data.contact || existingContact;
          } catch (updateError: any) {
            console.log('Update failed, returning existing contact:', updateError.response?.data);
            // If update fails, return existing contact
            return existingContact;
          }
        }
      }

      // Create new contact
      const response = await this.api.post('/contacts', contactData);
      return response.data.contact;
    } catch (error: any) {
      console.error('Error upserting MyT Automation contact:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Check if it's a duplicate error
      if (error.response?.data?.message?.includes('duplicate')) {
        // Try to get existing contact and return it
        if (contactData.email) {
          const existing = await this.getContactByEmail(contactData.email);
          if (existing) return existing;
        }
      }
      
      throw new Error('Failed to create or update contact in MyT Automation');
    }
  }

  // Add tags to contact
  async addTagsToContact(contactId: string, tags: string[]): Promise<void> {
    try {
      await this.api.post(`/contacts/${contactId}/tags`, { tags });
    } catch (error) {
      console.error('Error adding tags to GHL contact:', error);
      throw new Error('Failed to add tags to contact');
    }
  }

  // Remove tags from contact
  async removeTagsFromContact(contactId: string, tags: string[]): Promise<void> {
    try {
      await this.api.delete(`/contacts/${contactId}/tags`, { data: { tags } });
    } catch (error) {
      console.error('Error removing tags from GHL contact:', error);
      throw new Error('Failed to remove tags from contact');
    }
  }

  // Get company by name
  async getCompanyByName(name: string): Promise<MyTAutomationCompany | null> {
    try {
      const response = await this.api.get('/companies', {
        params: { name }
      });
      const companies = response.data.companies || [];
      return companies.length > 0 ? companies[0] : null;
    } catch (error) {
      console.error('Error fetching MyT Automation company:', error);
      return null;
    }
  }

  // Create or update company
  async upsertCompany(companyData: Partial<MyTAutomationCompany>): Promise<MyTAutomationCompany> {
    try {
      // Check if company exists
      if (companyData.name) {
        const existingCompany = await this.getCompanyByName(companyData.name);
        
        if (existingCompany) {
          // Update existing company
          const updateData = { ...companyData };
          delete updateData.name; // Don't send name when updating
          
          try {
            const response = await this.api.put(`/companies/${existingCompany.id}`, updateData);
            return response.data.company || existingCompany;
          } catch (updateError: any) {
            console.log('Company update failed, returning existing:', updateError.response?.data);
            return existingCompany;
          }
        }
      }

      // Create new company
      const response = await this.api.post('/companies', companyData);
      return response.data.company;
    } catch (error: any) {
      console.error('Error upserting MyT Automation company:', error);
      throw new Error('Failed to create or update company in MyT Automation');
    }
  }

  // Link contact to company
  async linkContactToCompany(contactId: string, companyId: string): Promise<void> {
    try {
      await this.api.put(`/contacts/${contactId}`, { companyId });
    } catch (error) {
      console.error('Error linking contact to company:', error);
    }
  }

  // Sync business with separate Company and Contact entities
  async syncBusinessWithCompany(businessData: any): Promise<{ contact: MyTAutomationContact; company?: MyTAutomationCompany }> {
    // First, create/update the Company with Companies House data
    let company: MyTAutomationCompany | undefined;
    
    if (businessData.name || businessData.businessName || businessData.company) {
      const companyName = businessData.name || businessData.businessName || businessData.company;
      
      const companyData: Partial<MyTAutomationCompany> = {
        name: companyName,
        website: businessData.website || businessData.businessWebsite,
        phone: businessData.phone || businessData.businessPhone,
        address: businessData.address || businessData.businessAddress,
        city: businessData.city || businessData.businessCity,
        postalCode: businessData.postcode || businessData.businessPostcode,
        customFields: {
          // Companies House specific fields
          companiesHouseNumber: businessData.companiesHouseNumber,
          sicCode: businessData.sicCode,
          vatNumber: businessData.vatNumber,
          registeredAddress: businessData.registeredAddress,
          incorporationDate: businessData.incorporationDate,
          accountsFilingDate: businessData.accountsFilingDate,
          confirmationStatementDate: businessData.confirmationStatementDate,
          companyStatus: businessData.companyStatus,
          businessType: businessData.businessType,
          turnover: businessData.turnover,
          employeeCount: businessData.employeeCount,
          industry: businessData.industry,
          businessCategory: businessData.businessCategory,
          businessEstablished: businessData.businessEstablished || businessData.foundedYear,
          
          // Additional business fields
          businessDescription: businessData.description || businessData.businessDescription,
          membershipTier: businessData.membershipTier,
          membershipStatus: businessData.membershipStatus,
          
          // Social media
          facebook: businessData.facebook || businessData.socialMedia?.facebook,
          twitter: businessData.twitter || businessData.socialMedia?.twitter,
          linkedin: businessData.linkedin || businessData.socialMedia?.linkedin,
          instagram: businessData.instagram || businessData.socialMedia?.instagram,
          youtube: businessData.youtube || businessData.socialMedia?.youtube,
          
          // Metadata
          dataSource: businessData.source || businessData.dataSource || 'CSV Import',
          importDate: businessData.importDate || new Date().toISOString(),
          notes: businessData.notes
        }
      };
      
      try {
        company = await this.upsertCompany(companyData);
        console.log(`Company synced to MyT Automation: ${companyName}`);
      } catch (error) {
        console.error(`Failed to sync company ${companyName}:`, error);
      }
    }
    
    // Then create/update the Contact with person data
    const contact = await this.syncBusinessMember({
      ...businessData,
      companyId: company?.id // Link to company if created
    });
    
    // Link contact to company if both exist
    if (contact.id && company?.id) {
      await this.linkContactToCompany(contact.id, company.id);
    }
    
    return { contact, company };
  }

  // Sync business member to MyT Automation with ALL custom fields
  async syncBusinessMember(member: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['CBA_Member'];
    
    // Add tier-specific tags
    if (member.membershipTier) {
      tags.push(`CBA_${member.membershipTier.replace(/\s+/g, '_')}`);
    }
    if (member.membershipStatus === 'active') tags.push('Active_Member');
    if (member.isTrialMember) tags.push('CBA_Trial_Member');
    if (member.emailVerified) tags.push('Email_Verified');
    if (member.isAdmin) tags.push('CBA_Admin');

    const contactData: Partial<MyTAutomationContact> = {
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      companyName: member.company || member.businessName,
      tags,
      customFields: {
        // Core User Fields
        membershipTier: member.membershipTier,
        membershipStatus: member.membershipStatus,
        isTrialMember: member.isTrialMember,
        trialDonationPaid: member.trialDonationPaid,
        donationAmount: member.donationAmount,
        donationDate: member.donationDate,
        membershipStartDate: member.membershipStartDate,
        membershipEndDate: member.membershipEndDate,
        accountStatus: member.accountStatus,
        suspensionReason: member.suspensionReason,
        suspendedAt: member.suspendedAt,
        suspendedBy: member.suspendedBy,
        isAdmin: member.isAdmin,
        emailVerified: member.emailVerified,
        
        // Professional Information
        company: member.company,
        jobTitle: member.jobTitle,
        title: member.title,
        bio: member.bio,
        qrHandle: member.qrHandle,
        isProfileHidden: member.isProfileHidden,
        
        // Student/Volunteer Information
        university: member.university,
        studentId: member.studentId,
        course: member.course,
        yearOfStudy: member.yearOfStudy,
        communityRole: member.communityRole,
        volunteerExperience: member.volunteerExperience,
        
        // Business Profile Fields
        businessName: member.businessName,
        businessDescription: member.businessDescription,
        businessAddress: member.businessAddress,
        businessCity: member.businessCity,
        businessPostcode: member.businessPostcode,
        businessPhone: member.businessPhone,
        businessEmail: member.businessEmail,
        businessWebsite: member.businessWebsite,
        businessCategory: member.businessCategory,
        businessEstablished: member.businessEstablished,
        employeeCount: member.employeeCount,
        isBusinessVerified: member.isBusinessVerified,
        isBusinessActive: member.isBusinessActive,
        
        // Companies House Fields
        companiesHouseNumber: member.companiesHouseNumber,
        sicCode: member.sicCode,
        vatNumber: member.vatNumber,
        registeredAddress: member.registeredAddress,
        incorporationDate: member.incorporationDate,
        accountsFilingDate: member.accountsFilingDate,
        confirmationStatementDate: member.confirmationStatementDate,
        companyStatus: member.companyStatus,
        businessType: member.businessType,
        turnover: member.turnover,
        
        // Financial Fields
        stripeCustomerId: member.stripeCustomerId,
        stripeSubscriptionId: member.stripeSubscriptionId,
        lastPaymentDate: member.lastPaymentDate,
        lastPaymentAmount: member.lastPaymentAmount,
        totalLifetimeValue: member.totalLifetimeValue,
        outstandingBalance: member.outstandingBalance,
        paymentMethod: member.paymentMethod,
        
        // Engagement Fields
        lastInteractionDate: new Date().toISOString(),
        totalInteractions: (member.totalInteractions || 0) + 1,
        preferredContactMethod: member.preferredContactMethod || 'email',
        marketingConsent: member.marketingConsent,
        newsletterSubscribed: member.newsletterSubscribed,
        smsOptIn: member.smsOptIn,
        
        // Affiliate Fields
        isAffiliate: member.isAffiliate,
        affiliateCode: member.affiliateCode,
        affiliateCommissionRate: member.affiliateCommissionRate,
        affiliateTotalEarned: member.affiliateTotalEarned,
        affiliateTotalPaid: member.affiliateTotalPaid,
        affiliatePaymentMethod: member.affiliatePaymentMethod,
        affiliateStripeAccountId: member.affiliateStripeAccountId,
        affiliateReferralCount: member.affiliateReferralCount,
        affiliateStatus: member.affiliateStatus
      }
    };

    return await this.upsertContact(contactData);
  }
  
  // Sync AI Summit attendee registration
  async syncAISummitAttendee(attendee: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['AI_Summit_Registered', 'AI_Summit_Attendee'];
    
    // Add role-specific tags
    if (attendee.participantRoles) {
      const roles = Array.isArray(attendee.participantRoles) ? attendee.participantRoles : [attendee.participantRoles];
      roles.forEach((role: string) => {
        tags.push(`AI_Summit_${role.charAt(0).toUpperCase() + role.slice(1)}`);
      });
    }
    if (attendee.eventCheckedIn) tags.push('AI_Summit_Checked_In');
    if (attendee.badgeId) tags.push('Badge_Issued');

    const contactData: Partial<MyTAutomationContact> = {
      email: attendee.email,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      phone: attendee.phone,
      companyName: attendee.company,
      tags,
      customFields: {
        // AI Summit Fields
        aiSummitRegistered: true,
        businessType: attendee.businessType,
        aiInterest: attendee.aiInterest,
        accessibilityNeeds: attendee.accessibilityNeeds,
        participantRoles: attendee.participantRoles?.join(','),
        customRole: attendee.customRole,
        primaryRole: attendee.primaryRole || 'attendee',
        
        // Badge Information
        badgeId: attendee.badgeId,
        badgeDesign: attendee.badgeDesign,
        badgeColor: attendee.badgeColor,
        accessLevel: attendee.accessLevel,
        badgePrinted: attendee.badgePrinted,
        badgePrintedAt: attendee.badgePrintedAt,
        
        // Check-in Tracking
        eventCheckedIn: attendee.eventCheckedIn,
        checkInTime: attendee.checkInTime,
        checkOutTime: attendee.checkOutTime,
        checkInLocation: attendee.checkInLocation,
        checkInMethod: attendee.checkInMethod,
        eventAttendanceNotes: attendee.eventAttendanceNotes,
        
        // Contact Info
        company: attendee.company,
        jobTitle: attendee.jobTitle,
        title: attendee.title
      }
    };

    return await this.upsertContact(contactData);
  }
  
  // Sync exhibitor registration
  async syncExhibitor(exhibitor: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['AI_Summit_Registered', 'AI_Summit_Exhibitor'];
    if (exhibitor.previousExhibitor) tags.push('Previous_Exhibitor');

    const contactData: Partial<MyTAutomationContact> = {
      email: exhibitor.contactEmail,
      firstName: exhibitor.contactName?.split(' ')[0],
      lastName: exhibitor.contactName?.split(' ').slice(1).join(' '),
      phone: exhibitor.phone,
      companyName: exhibitor.exhibitorCompanyName,
      tags,
      customFields: {
        // Exhibitor Specific Fields
        exhibitorCompanyName: exhibitor.exhibitorCompanyName,
        exhibitorContactName: exhibitor.contactName,
        exhibitorWebsite: exhibitor.exhibitorWebsite,
        productsServices: exhibitor.productsServices,
        exhibitionGoals: exhibitor.exhibitionGoals,
        boothRequirements: exhibitor.boothRequirements,
        electricalNeeds: exhibitor.electricalNeeds,
        internetNeeds: exhibitor.internetNeeds,
        specialRequirements: exhibitor.specialRequirements,
        marketingMaterials: exhibitor.marketingMaterials,
        numberOfExhibitorAttendees: exhibitor.numberOfExhibitorAttendees,
        previousExhibitor: exhibitor.previousExhibitor,
        referralSource: exhibitor.referralSource,
        
        // General AI Summit Fields
        aiSummitRegistered: true,
        primaryRole: 'exhibitor',
        participantRoles: 'exhibitor'
      }
    };

    return await this.upsertContact(contactData);
  }
  
  // Sync speaker registration
  async syncSpeaker(speaker: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['AI_Summit_Registered', 'AI_Summit_Speaker'];
    if (speaker.previousSpeaking) tags.push('Previous_Speaker');

    const contactData: Partial<MyTAutomationContact> = {
      email: speaker.email,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      phone: speaker.phone,
      companyName: speaker.company,
      tags,
      customFields: {
        // Speaker Specific Fields
        speakerLinkedIn: speaker.linkedIn,
        speakerBio: speaker.bio,
        sessionType: speaker.sessionType,
        talkTitle: speaker.talkTitle,
        talkDescription: speaker.talkDescription,
        talkDuration: speaker.talkDuration,
        audienceLevel: speaker.audienceLevel,
        speakingExperience: speaker.speakingExperience,
        previousSpeaking: speaker.previousSpeaking,
        techRequirements: speaker.techRequirements,
        availableSlots: speaker.availableSlots,
        motivationToSpeak: speaker.motivationToSpeak,
        keyTakeaways: speaker.keyTakeaways,
        interactiveElements: speaker.interactiveElements,
        handoutsProvided: speaker.handoutsProvided,
        
        // General AI Summit Fields
        aiSummitRegistered: true,
        primaryRole: 'speaker',
        participantRoles: 'speaker'
      }
    };

    return await this.upsertContact(contactData);
  }
  
  // Sync volunteer registration
  async syncVolunteer(volunteer: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['AI_Summit_Registered', 'AI_Summit_Volunteer'];

    const contactData: Partial<MyTAutomationContact> = {
      email: volunteer.email,
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      phone: volunteer.phone,
      tags,
      customFields: {
        // Volunteer Specific Fields
        volunteerRole: volunteer.volunteerRole,
        volunteerShift: volunteer.volunteerShift,
        volunteerAvailability: volunteer.volunteerAvailability,
        emergencyContact: volunteer.emergencyContact,
        tShirtSize: volunteer.tShirtSize,
        dietaryRequirements: volunteer.dietaryRequirements,
        
        // General Volunteer Info
        volunteerExperience: volunteer.volunteerExperience,
        communityRole: volunteer.communityRole,
        
        // General AI Summit Fields
        aiSummitRegistered: true,
        primaryRole: 'volunteer',
        participantRoles: 'volunteer'
      }
    };

    return await this.upsertContact(contactData);
  }
  
  // Sync sponsor registration
  async syncSponsor(sponsor: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['AI_Summit_Registered', 'AI_Summit_Sponsor'];
    if (sponsor.sponsorshipTier) {
      tags.push(`Sponsor_${sponsor.sponsorshipTier}`);
    }

    const contactData: Partial<MyTAutomationContact> = {
      email: sponsor.contactEmail,
      firstName: sponsor.contactName?.split(' ')[0],
      lastName: sponsor.contactName?.split(' ').slice(1).join(' '),
      phone: sponsor.contactPhone,
      companyName: sponsor.companyName,
      tags,
      customFields: {
        // Sponsor Specific Fields
        sponsorshipTier: sponsor.sponsorshipTier,
        sponsorshipAmount: sponsor.sponsorshipAmount,
        sponsorshipBenefits: sponsor.sponsorshipBenefits,
        sponsorLogoUrl: sponsor.logoUrl,
        sponsorDescription: sponsor.companyDescription,
        sponsorWebsite: sponsor.companyWebsite,
        sponsorIndustry: sponsor.industry,
        sponsorFounded: sponsor.founded,
        sponsorEmployees: sponsor.employees,
        sponsorLocation: sponsor.location,
        sponsorSpecialties: sponsor.specialties,
        sponsorAchievements: sponsor.achievements,
        sponsorContactPerson: sponsor.contactName,
        sponsorContactEmail: sponsor.contactEmail,
        sponsorContactPhone: sponsor.contactPhone,
        sponsorMarketingNeeds: sponsor.marketingNeeds,
        sponsorEventGoals: sponsor.eventGoals,
        sponsorBoothStaff: sponsor.boothStaff,
        sponsorSocialLinkedIn: sponsor.socialLinkedIn,
        sponsorSocialTwitter: sponsor.socialTwitter,
        
        // General AI Summit Fields
        aiSummitRegistered: true,
        primaryRole: 'sponsor',
        participantRoles: 'sponsor'
      }
    };

    return await this.upsertContact(contactData);
  }
  
  // Sync workshop registration
  async syncWorkshopRegistration(registration: any): Promise<MyTAutomationContact> {
    const tags: string[] = ['Workshop_Registered'];
    
    const existingContact = await this.getContactByEmail(registration.email);
    if (!existingContact) {
      throw new Error('Contact must exist before workshop registration');
    }

    const updatedFields = {
      ...existingContact.customFields,
      registeredWorkshops: registration.workshops?.join(', '),
      workshopExperienceLevel: registration.experienceLevel,
      workshopSpecificInterests: registration.specificInterests,
      workshopAccessibilityNeeds: registration.accessibilityNeeds,
      workshopCheckedIn: registration.checkedIn,
      workshopNoShow: registration.noShow
    };

    return await this.upsertContact({
      email: registration.email,
      tags: [...(existingContact.tags || []), ...tags],
      customFields: updatedFields
    });
  }

  // Create workflow trigger for new member
  async triggerMemberOnboardingWorkflow(contactId: string): Promise<void> {
    try {
      // This would trigger a specific workflow in GHL
      // The workflow ID would need to be configured based on your GHL setup
      await this.api.post('/workflows/trigger', {
        contactId,
        workflowId: process.env.GHL_ONBOARDING_WORKFLOW_ID,
      });
    } catch (error) {
      console.error('Error triggering GHL workflow:', error);
      // Don't throw here as this is optional functionality
    }
  }

  // Send SMS notification
  async sendSMSNotification(phone: string, message: string): Promise<void> {
    try {
      await this.api.post('/conversations/messages', {
        type: 'SMS',
        contactPhone: phone,
        message,
      });
    } catch (error) {
      console.error('Error sending SMS via GHL:', error);
      throw new Error('Failed to send SMS notification');
    }
  }

  // Send email notification
  async sendEmailNotification(email: string, subject: string, htmlContent: string): Promise<void> {
    try {
      await this.api.post('/conversations/messages', {
        type: 'Email',
        contactEmail: email,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending email via GHL:', error);
      throw new Error('Failed to send email notification');
    }
  }

  // Check if API is working
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/contacts?limit=1');
      return true;
    } catch (error) {
      console.error('GHL API connection test failed:', error);
      return false;
    }
  }

  // Send message to GHL AI chatbot
  async sendChatbotMessage(message: string, sessionId: string, contactInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<{ response: string; success: boolean }> {
    try {
      // If contact info is provided, ensure contact exists in GHL
      let contactId: string | undefined;
      
      if (contactInfo?.email) {
        try {
          const contact = await this.upsertContact({
            email: contactInfo.email,
            firstName: contactInfo.firstName,
            lastName: contactInfo.lastName,
            phone: contactInfo.phone,
            tags: ['Website_Chatbot_User'],
            customFields: {
              chatbot_session: sessionId,
              first_contact_source: 'Website_Chatbot'
            }
          });
          contactId = contact.id;
        } catch (error) {
          console.warn('Failed to create/update contact for chatbot:', error);
        }
      }

      // Send message to GHL conversation or automation
      const response = await this.api.post('/conversations/message', {
        type: 'chat',
        message,
        sessionId,
        contactId,
        source: 'website_chatbot',
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: 'CBA_Website_Chatbot'
        }
      });

      // Return the AI response from GHL
      return {
        response: response.data.reply || this.getDefaultResponse(message),
        success: true
      };

    } catch (error) {
      console.error('Error sending message to GHL chatbot:', error);
      
      // Return intelligent fallback response
      return {
        response: this.getDefaultResponse(message),
        success: false
      };
    }
  }

  // Intelligent fallback responses for common queries
  private getDefaultResponse(message: string): string {
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

  // Track chatbot analytics
  async trackChatbotInteraction(sessionId: string, message: string, response: string, success: boolean): Promise<void> {
    try {
      // This could be used to track chatbot effectiveness
      // Could be stored in a separate analytics table or sent to GHL as custom fields
      const analyticsData = {
        sessionId,
        message,
        response,
        success,
        timestamp: new Date().toISOString(),
        source: 'website_chatbot'
      };
      
      // Log for now - could be enhanced to store in database
      console.log('Chatbot interaction:', analyticsData);
    } catch (error) {
      console.error('Error tracking chatbot interaction:', error);
    }
  }
}

// Singleton instance
let mytAutomationServiceInstance: MyTAutomationService | null = null;

export function getMyTAutomationService(): MyTAutomationService | null {
  if (!process.env.GHL_API_KEY) {
    return null;
  }

  if (!mytAutomationServiceInstance) {
    try {
      mytAutomationServiceInstance = new MyTAutomationService();
    } catch (error) {
      console.error('Failed to initialize MyT Automation service:', error);
      return null;
    }
  }

  return mytAutomationServiceInstance;
}