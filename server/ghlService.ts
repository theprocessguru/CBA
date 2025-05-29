import axios, { AxiosInstance } from 'axios';

export interface GHLContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  status: string;
  monetaryValue?: number;
  contactId: string;
}

export class GHLService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('GHL_API_KEY is required');
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
  async getContacts(): Promise<GHLContact[]> {
    try {
      const response = await this.api.get('/contacts');
      return response.data.contacts || [];
    } catch (error) {
      console.error('Error fetching GHL contacts:', error);
      throw new Error('Failed to fetch contacts from Go High Level');
    }
  }

  // Get contact by email
  async getContactByEmail(email: string): Promise<GHLContact | null> {
    try {
      const response = await this.api.get('/contacts', {
        params: { email }
      });
      const contacts = response.data.contacts || [];
      return contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      console.error('Error fetching GHL contact by email:', error);
      return null;
    }
  }

  // Create or update contact
  async upsertContact(contactData: Partial<GHLContact>): Promise<GHLContact> {
    try {
      // Check if contact exists
      if (contactData.email) {
        const existingContact = await this.getContactByEmail(contactData.email);
        
        if (existingContact) {
          // Update existing contact
          const response = await this.api.put(`/contacts/${existingContact.id}`, contactData);
          return response.data.contact;
        }
      }

      // Create new contact
      const response = await this.api.post('/contacts', contactData);
      return response.data.contact;
    } catch (error) {
      console.error('Error upserting GHL contact:', error);
      throw new Error('Failed to create or update contact in Go High Level');
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

  // Sync business member to GHL
  async syncBusinessMember(member: {
    email: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    phone?: string;
    membershipTier?: string;
  }): Promise<GHLContact> {
    const contactData: Partial<GHLContact> = {
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      companyName: member.businessName,
      tags: ['CBA_Member'],
      customFields: {
        membership_tier: member.membershipTier || 'Standard',
        business_name: member.businessName,
        sync_source: 'CBA_Directory'
      }
    };

    if (member.membershipTier) {
      contactData.tags?.push(`CBA_${member.membershipTier}`);
    }

    return await this.upsertContact(contactData);
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
}

// Singleton instance
let ghlServiceInstance: GHLService | null = null;

export function getGHLService(): GHLService | null {
  if (!process.env.GHL_API_KEY) {
    return null;
  }

  if (!ghlServiceInstance) {
    try {
      ghlServiceInstance = new GHLService();
    } catch (error) {
      console.error('Failed to initialize GHL service:', error);
      return null;
    }
  }

  return ghlServiceInstance;
}