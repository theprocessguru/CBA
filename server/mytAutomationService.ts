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