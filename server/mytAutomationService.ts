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

export interface MyTAutomationCustomField {
  id: string;
  name: string;
  type: 'text' | 'dropdown' | 'checkbox' | 'date' | 'number' | 'email' | 'phone' | 'url' | 'textarea';
  object: 'contact' | 'opportunity';
  group?: string;
  options?: Array<{ name: string; value: string }>;
  required?: boolean;
}

export interface MyTAutomationWorkflow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  triggerType?: string;
  actions?: Array<{
    type: string;
    config: Record<string, any>;
  }>;
}

export interface CreateCustomFieldData {
  name: string;
  type: 'text' | 'dropdown' | 'checkbox' | 'date' | 'number' | 'email' | 'phone' | 'url' | 'textarea';
  object: 'contact' | 'opportunity';
  group?: string;
  options?: Array<{ name: string; value: string }>;
  required?: boolean;
}

export class MyTAutomationService {
  private api: AxiosInstance;
  private apiV2: AxiosInstance;
  private apiKey: string;
  private oauthToken: string;
  private syncEnabled: boolean;

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.oauthToken = process.env.GHL_OAUTH_TOKEN || '';
    this.syncEnabled = process.env.MYT_AUTOMATION_SYNC_ENABLED !== 'false';
    
    console.log(`🎯 MYT_AUTOMATION_SYNC_ENABLED: "${process.env.MYT_AUTOMATION_SYNC_ENABLED}"`);
    console.log(`🎯 Sync enabled: ${this.syncEnabled}`);
    
    if (!this.syncEnabled) {
      console.log('🔄 MYT Automation syncing is DISABLED - Users will be stored in CBA app only');
    } else {
      console.log('✅ MYT Automation syncing is ENABLED - Real API calls active');
    }
    
    if (!this.apiKey && this.syncEnabled) {
      throw new Error('GHL_API_KEY is required for MyT Automation');
    }

    // API v1 for existing functionality (contacts, companies, workflows)
    this.api = axios.create({
      baseURL: 'https://rest.gohighlevel.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // API v2 for custom fields management (requires OAuth)
    this.apiV2 = axios.create({
      baseURL: 'https://rest.gohighlevel.com/v2',
      headers: {
        'Authorization': `Bearer ${this.oauthToken || this.apiKey}`,
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

  // Create new contact
  async createContact(contactData: Partial<MyTAutomationContact>): Promise<MyTAutomationContact> {
    try {
      const response = await this.api.post('/contacts', contactData);
      return response.data.contact;
    } catch (error: any) {
      console.error('Error creating MyT Automation contact:', error);
      throw new Error('Failed to create contact in MyT Automation');
    }
  }

  // Add contact (alias for upsertContact to maintain compatibility)
  async addContact(contactData: Partial<MyTAutomationContact>): Promise<MyTAutomationContact> {
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping contact: ${contactData.email}`);
      return {
        id: `mock_${Date.now()}`,
        email: contactData.email || '',
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        phone: contactData.phone,
        companyName: contactData.companyName,
        tags: contactData.tags || [],
        customFields: contactData.customFields || {}
      };
    }
    
    return await this.upsertContact(contactData);
  }

  // Update existing contact
  async updateContact(contactId: string, contactData: Partial<MyTAutomationContact>): Promise<MyTAutomationContact> {
    try {
      const updateData = { ...contactData };
      // Remove email to avoid duplicate error
      delete updateData.email;
      
      const response = await this.api.put(`/contacts/${contactId}`, updateData);
      return response.data.contact;
    } catch (error: any) {
      console.error('Error updating MyT Automation contact:', error);
      throw new Error('Failed to update contact in MyT Automation');
    }
  }

  // Add contact to workflow
  async addContactToWorkflow(contactId: string, workflowId: string): Promise<void> {
    try {
      await this.api.post(`/contacts/${contactId}/workflow/${workflowId}`);
      console.log(`Added contact ${contactId} to workflow ${workflowId}`);
    } catch (error) {
      console.error('Error adding contact to workflow:', error);
      // Don't throw - workflows might not be set up yet
    }
  }

  // Send SMS via MyT Automation
  async sendSMS(contactId: string, message: string): Promise<void> {
    try {
      await this.api.post(`/contacts/${contactId}/sms`, {
        message: message
      });
      console.log(`SMS sent to contact ${contactId}`);
    } catch (error) {
      console.error('Error sending SMS via MyT Automation:', error);
      // Don't throw - SMS might not be configured
    }
  }

  // Create or update contact
  async upsertContact(contactData: Partial<MyTAutomationContact>): Promise<MyTAutomationContact> {
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping contact: ${contactData.email}`);
      return {
        id: `mock_${Date.now()}`,
        email: contactData.email || '',
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        phone: contactData.phone,
        companyName: contactData.companyName,
        tags: contactData.tags || [],
        customFields: contactData.customFields || {}
      };
    }
    
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
          // Companies House exact field names
          company_number: businessData.companiesHouseNumber || businessData.company_number,
          sic_codes: businessData.sicCode || businessData.sic_codes,
          registered_office_address: businessData.registeredAddress || businessData.registered_office_address,
          date_of_creation: businessData.incorporationDate || businessData.date_of_creation,
          accounting_reference_date: businessData.accountsFilingDate || businessData.accounting_reference_date,
          confirmation_statement_last_made_up_to: businessData.confirmationStatementDate || businessData.confirmation_statement_last_made_up_to,
          company_status: businessData.companyStatus || businessData.company_status,
          company_type: businessData.businessType || businessData.company_type,
          jurisdiction: businessData.jurisdiction || 'england-wales',
          has_been_liquidated: businessData.has_been_liquidated || false,
          has_insolvency_history: businessData.has_insolvency_history || false,
          
          // HMRC/Tax fields (not Companies House)
          vat_number: businessData.vatNumber || businessData.vat_number,
          turnover: businessData.turnover,
          employee_count: businessData.employeeCount || businessData.employee_count,
          industry: businessData.industry,
          business_category: businessData.businessCategory || businessData.business_category,
          business_established: businessData.businessEstablished || businessData.foundedYear,
          
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
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping member: ${member.email}`);
      return {
        id: `mock_${Date.now()}`,
        email: member.email || '',
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        companyName: member.company || member.businessName,
        tags: ['CBA_Member'],
        customFields: {}
      };
    }
    
    const tags: string[] = ['CBA_Member'];
    
    // Add tier-specific tags
    if (member.membershipTier) {
      tags.push(`CBA_${member.membershipTier.replace(/\s+/g, '_')}`);
    }
    if (member.membershipStatus === 'active') tags.push('Active_Member');
    if (member.isTrialMember) tags.push('CBA_Trial_Member');
    if (member.emailVerified) tags.push('Email_Verified');
    if (member.isAdmin) tags.push('CBA_Admin');
    
    // Add person type specific tags for workflow automation
    const personType = member.personType || member.participantType || 'business';
    tags.push(`CBA_${personType.charAt(0).toUpperCase() + personType.slice(1)}`);
    
    // Add special workflow trigger tags for priority person types
    if (personType === 'administrator') tags.push('Admin_Onboarding');
    if (personType === 'media') tags.push('Media_Kit_Required');
    if (personType === 'sponsor') tags.push('Sponsor_Welcome');
    if (personType === 'vip') tags.push('VIP_Experience');
    if (personType === 'speaker') tags.push('Speaker_Resources');
    if (personType === 'exhibitor') tags.push('Exhibitor_Setup');
    if (personType === 'volunteer') tags.push('Volunteer_Training');

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
        
        // Person Type Classification
        participantType: member.personType || member.participantType || 'business',
        
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
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping AI Summit attendee: ${attendee.email}`);
      return {
        id: `mock_${Date.now()}`,
        email: attendee.email || '',
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        phone: attendee.phone,
        companyName: attendee.company,
        tags: ['AI_Summit_Registered', 'AI_Summit_Attendee'],
        customFields: {}
      };
    }
    
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
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping exhibitor: ${exhibitor.contactEmail}`);
      return {
        id: `mock_${Date.now()}`,
        email: exhibitor.contactEmail || '',
        firstName: exhibitor.contactName?.split(' ')[0],
        lastName: exhibitor.contactName?.split(' ').slice(1).join(' '),
        phone: exhibitor.phone,
        companyName: exhibitor.exhibitorCompanyName,
        tags: ['AI_Summit_Registered', 'AI_Summit_Exhibitor'],
        customFields: {}
      };
    }
    
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
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping speaker: ${speaker.contactEmail}`);
      return {
        id: `mock_${Date.now()}`,
        email: speaker.contactEmail || '',
        firstName: speaker.contactName?.split(' ')[0],
        lastName: speaker.contactName?.split(' ').slice(1).join(' '),
        phone: speaker.phone,
        companyName: speaker.company,
        tags: ['AI_Summit_Registered', 'AI_Summit_Speaker'],
        customFields: {}
      };
    }
    
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
    if (!this.syncEnabled) {
      console.log(`⏸️  MYT Automation sync disabled - skipping volunteer: ${volunteer.email}`);
      return {
        id: `mock_${Date.now()}`,
        email: volunteer.email || '',
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        phone: volunteer.phone,
        companyName: volunteer.company,
        tags: ['AI_Summit_Registered', 'AI_Summit_Volunteer'],
        customFields: {}
      };
    }
    
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
      return "You can reach us at info@croydonba.org.uk or visit our contact page for more ways to get in touch. Our team typically responds within 24 hours. Is there something specific I can help you with right now?";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to the Croydon Business Association. I'm here to help you with information about membership, events, business support, and more. What would you like to know?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "Our membership starts at just £9.99/month for Starter level, with Growth+ at £19.99/month, Strategic+ at £39.99/month, and premium tiers up to £199.99/month. Each tier includes increasingly valuable benefits. Would you like me to explain what's included in each level?";
    }
    
    // Default response
    return "Thank you for your message! I'm here to help with information about CBA membership, events, business support, and services. For detailed assistance, I can connect you with our team at info@croydonba.org.uk. What specific information can I help you find?";
  }

  // ===== CUSTOM FIELDS MANAGEMENT (API v2) =====

  // Check if API v2 is available
  private isApiV2Available(): boolean {
    return !!this.oauthToken || !!this.apiKey;
  }

  // Create custom field
  async createCustomField(fieldData: CreateCustomFieldData): Promise<MyTAutomationCustomField> {
    if (!this.isApiV2Available()) {
      throw new Error('OAuth token required for custom fields management. Set GHL_OAUTH_TOKEN environment variable.');
    }

    try {
      const response = await this.apiV2.post('/custom-fields', fieldData);
      return response.data.customField || response.data;
    } catch (error: any) {
      console.error('Error creating custom field:', error?.response?.data || error);
      throw new Error(`Failed to create custom field: ${error?.response?.data?.message || error.message}`);
    }
  }

  // Get all custom fields
  async getCustomFields(objectType: 'contact' | 'opportunity' = 'contact'): Promise<MyTAutomationCustomField[]> {
    if (!this.isApiV2Available()) {
      throw new Error('OAuth token required for custom fields management.');
    }

    try {
      const response = await this.apiV2.get('/custom-fields', {
        params: { object: objectType }
      });
      return response.data.customFields || response.data || [];
    } catch (error: any) {
      console.error('Error fetching custom fields:', error?.response?.data || error);
      return [];
    }
  }

  // Get specific custom field by ID
  async getCustomField(fieldId: string): Promise<MyTAutomationCustomField | null> {
    if (!this.isApiV2Available()) {
      throw new Error('OAuth token required for custom fields management.');
    }

    try {
      const response = await this.apiV2.get(`/custom-fields/${fieldId}`);
      return response.data.customField || response.data;
    } catch (error: any) {
      console.error('Error fetching custom field:', error?.response?.data || error);
      return null;
    }
  }

  // Update custom field
  async updateCustomField(fieldId: string, updates: Partial<CreateCustomFieldData>): Promise<MyTAutomationCustomField> {
    if (!this.isApiV2Available()) {
      throw new Error('OAuth token required for custom fields management.');
    }

    try {
      const response = await this.apiV2.put(`/custom-fields/${fieldId}`, updates);
      return response.data.customField || response.data;
    } catch (error: any) {
      console.error('Error updating custom field:', error?.response?.data || error);
      throw new Error(`Failed to update custom field: ${error?.response?.data?.message || error.message}`);
    }
  }

  // Delete custom field
  async deleteCustomField(fieldId: string): Promise<boolean> {
    if (!this.isApiV2Available()) {
      throw new Error('OAuth token required for custom fields management.');
    }

    try {
      await this.apiV2.delete(`/custom-fields/${fieldId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting custom field:', error?.response?.data || error);
      return false;
    }
  }

  // Create or update the participantType field with your 14 person types
  async ensureParticipantTypeField(): Promise<MyTAutomationCustomField> {
    const fieldName = 'participantType';
    const personTypeOptions = [
      { name: 'Business Member', value: 'business' },
      { name: 'Administrator', value: 'administrator' },
      { name: 'Media', value: 'media' },
      { name: 'Staff', value: 'staff' },
      { name: 'Sponsor', value: 'sponsor' },
      { name: 'VIP Guest', value: 'vip' },
      { name: 'Councillor', value: 'councillor' },
      { name: 'Exhibitor', value: 'exhibitor' },
      { name: 'Speaker', value: 'speaker' },
      { name: 'Business Owner', value: 'business_owner' },
      { name: 'Volunteer', value: 'volunteer' },
      { name: 'Resident', value: 'resident' },
      { name: 'Attendee', value: 'attendee' },
      { name: 'Student', value: 'student' }
    ];

    try {
      // First, try to find existing participantType field
      const existingFields = await this.getCustomFields('contact');
      const existingField = existingFields.find(field => 
        field.name.toLowerCase() === fieldName.toLowerCase()
      );

      if (existingField) {
        console.log('ParticipantType field exists, updating with new options...');
        return await this.updateCustomField(existingField.id, {
          name: fieldName,
          type: 'dropdown',
          object: 'contact',
          options: personTypeOptions,
          group: 'Person Classification'
        });
      } else {
        console.log('Creating new participantType field...');
        return await this.createCustomField({
          name: fieldName,
          type: 'dropdown',
          object: 'contact',
          options: personTypeOptions,
          group: 'Person Classification',
          required: false
        });
      }
    } catch (error: any) {
      console.error('Error ensuring participantType field:', error);
      throw error;
    }
  }

  // Test API v2 connection
  async testApiV2Connection(): Promise<boolean> {
    if (!this.isApiV2Available()) {
      return false;
    }

    try {
      await this.getCustomFields('contact');
      return true;
    } catch (error) {
      console.error('API v2 connection test failed:', error);
      return false;
    }
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

  // ===== WORKFLOW MANAGEMENT =====

  // Get all workflows
  async getWorkflows(): Promise<MyTAutomationWorkflow[]> {
    if (!this.syncEnabled) {
      console.log('⏸️  MYT Automation sync disabled - returning mock workflows');
      return [];
    }

    try {
      const response = await this.api.get('/workflows');
      return response.data.workflows || response.data || [];
    } catch (error: any) {
      console.error('Error fetching workflows:', error?.response?.data || error);
      return [];
    }
  }

  // Get specific workflow by ID
  async getWorkflow(workflowId: string): Promise<MyTAutomationWorkflow | null> {
    if (!this.syncEnabled) {
      console.log('⏸️  MYT Automation sync disabled - returning null workflow');
      return null;
    }

    try {
      const response = await this.api.get(`/workflows/${workflowId}`);
      return response.data.workflow || response.data;
    } catch (error: any) {
      console.error('Error fetching workflow:', error?.response?.data || error);
      return null;
    }
  }

  // Create a new workflow
  async createWorkflow(workflowData: CreateWorkflowData): Promise<MyTAutomationWorkflow | null> {
    if (!this.syncEnabled) {
      console.log('⏸️  MYT Automation sync disabled - skipping workflow creation');
      return {
        id: `mock_workflow_${Date.now()}`,
        name: workflowData.name,
        status: 'active',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    try {
      const response = await this.api.post('/workflows', {
        name: workflowData.name,
        description: workflowData.description || `Automated workflow for ${workflowData.name}`,
        status: 'active',
        // Basic workflow structure - can be enhanced
        triggers: workflowData.triggerType ? [{
          type: workflowData.triggerType,
          config: {}
        }] : [],
        actions: workflowData.actions || [
          {
            type: 'send_email',
            config: {
              template: 'event_registration_confirmation',
              delay: 0
            }
          },
          {
            type: 'add_tag',
            config: {
              tags: [workflowData.name.replace(/\s+/g, '_')]
            }
          }
        ]
      });
      
      const workflow = response.data.workflow || response.data;
      console.log(`✅ Created workflow: ${workflow.name} (ID: ${workflow.id})`);
      return workflow;
    } catch (error: any) {
      console.error('Error creating workflow:', error?.response?.data || error);
      
      // Return a mock workflow if creation fails (for development)
      console.log('🔄 Returning mock workflow due to API error');
      return {
        id: `fallback_${Date.now()}`,
        name: workflowData.name,
        status: 'active',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  // Create event-specific workflow automatically
  async createEventWorkflow(eventData: any): Promise<{ workflowId: string; tagName: string }> {
    const eventName = eventData.eventName || eventData.name || 'Event';
    const eventSlug = eventData.eventSlug || eventName.toLowerCase().replace(/\s+/g, '-');
    
    const workflowName = `${eventName} - Registration Follow-up`;
    const tagName = `Event_${eventSlug.replace(/-/g, '_')}`;

    try {
      const workflow = await this.createWorkflow({
        name: workflowName,
        description: `Automated follow-up sequence for ${eventName} registrations`,
        triggerType: 'tag_added',
        actions: [
          {
            type: 'send_email',
            config: {
              template: 'event_registration_confirmation',
              subject: `Welcome to ${eventName}!`,
              delay: 0
            }
          },
          {
            type: 'send_sms',
            config: {
              message: `Thanks for registering for ${eventName}! We'll send you details soon.`,
              delay: 300 // 5 minutes
            }
          },
          {
            type: 'send_email',
            config: {
              template: 'event_reminder',
              subject: `Reminder: ${eventName} is tomorrow!`,
              delay: 86400 // 24 hours before event
            }
          }
        ]
      });

      return {
        workflowId: workflow?.id || `event_${eventSlug}_${Date.now()}`,
        tagName: tagName
      };
    } catch (error) {
      console.error('Error creating event workflow:', error);
      
      // Return fallback values
      return {
        workflowId: `event_${eventSlug}_${Date.now()}`,
        tagName: tagName
      };
    }
  }

  // Add contact to event workflow
  async addContactToEventWorkflow(contactId: string, workflowId: string, tagName: string): Promise<void> {
    try {
      // Add the tag first (which triggers the workflow)
      await this.addTagsToContact(contactId, [tagName]);
      
      // Then add to workflow
      await this.addContactToWorkflow(contactId, workflowId);
      
      console.log(`✅ Added contact ${contactId} to event workflow ${workflowId} with tag ${tagName}`);
    } catch (error) {
      console.error('Error adding contact to event workflow:', error);
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